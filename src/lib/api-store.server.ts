import crypto from "node:crypto";

// Temporary in-memory store for local writes until the backend repository is wired in.
// Server-only: imported only by route handlers under src/routes/api/*.

export type HistoryItem = {
  id: string;
  timestamp: string;
  model: string;
  provider: string;
  status: "completed" | "blocked" | "recovered" | "routed";
  latencyMs: number;
  costUsd: number;
  prompt: string;
};

export type Project = {
  id: string;
  name: string;
  slug: string;
  environment: "production" | "staging" | "development";
  createdAt: string;
  requests: number;
};

export type ApiKey = {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  createdAt: string;
  lastUsedAt: string | null;
};

export type Metrics = {
  totalRequests: number;
  avgLatencyMs: number;
  costSavedUsd: number;
  threatsBlocked: number;
  healthPct: number;
  updatedAt: string;
};

const rid = () => crypto.randomUUID();

type Store = {
  history: HistoryItem[];
  projects: Project[];
  keys: ApiKey[];
};

declare global {
  // eslint-disable-next-line no-var
  var __ORCH_STORE__: Store | undefined;
}

const store: Store =
  globalThis.__ORCH_STORE__ ??
  (globalThis.__ORCH_STORE__ = {
    history: [],
    projects: [],
    keys: [],
  });

export function getStore() {
  return store;
}

export function recordDemoEvent(input: {
  model?: string;
  status?: HistoryItem["status"];
  latencyMs?: number;
  costUsd?: number;
  inputTokens?: number;
  outputTokens?: number;
}) {
  const item: HistoryItem & { inputTokens?: number; outputTokens?: number } = {
    id: rid(),
    timestamp: new Date().toISOString(),
    model: input.model ?? "orchestra-demo-model",
    provider: "demo",
    status: input.status ?? "completed",
    latencyMs: Math.max(0, Math.round(input.latencyMs ?? 42)),
    costUsd: Number(input.costUsd ?? 0.000001),
    prompt: "Demo request",
    inputTokens: Math.max(0, Math.round(input.inputTokens ?? 24)),
    outputTokens: Math.max(0, Math.round(input.outputTokens ?? 48)),
  };
  store.history.unshift(item);
  return item;
}

export function computeMetrics(): Metrics {
  const recent = store.history.slice(0, 100);
  const avgLatency = recent.reduce((s, h) => s + h.latencyMs, 0) / Math.max(recent.length, 1);
  const blocked = store.history.filter((h) => h.status === "blocked").length;
  return {
    totalRequests: store.history.length,
    avgLatencyMs: Math.round(avgLatency),
    costSavedUsd: 0,
    threatsBlocked: blocked,
    healthPct: recent.length ? 100 : 0,
    updatedAt: new Date().toISOString(),
  };
}

export function newId() {
  return rid();
}
