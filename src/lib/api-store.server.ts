// In-memory demo store. Resets on every deploy / cold start.
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

const rid = () => Math.random().toString(36).slice(2, 10);

function seedHistory(): HistoryItem[] {
  const providers = ["openai", "anthropic", "google", "mistral"];
  const models = ["gpt-4o", "claude-3.5-sonnet", "gemini-1.5-pro", "mistral-large"];
  const statuses: HistoryItem["status"][] = ["completed", "completed", "completed", "routed", "recovered", "blocked"];
  return Array.from({ length: 120 }).map((_, i) => ({
    id: rid(),
    timestamp: new Date(Date.now() - i * 60_000 * 7).toISOString(),
    model: models[i % models.length],
    provider: providers[i % providers.length],
    status: statuses[i % statuses.length],
    latencyMs: 180 + Math.round(Math.random() * 400),
    costUsd: Number((Math.random() * 0.12).toFixed(4)),
    prompt: ["Summarize quarterly report", "Generate launch email", "Refactor SQL query", "Classify ticket priority"][i % 4],
  }));
}

function seedProjects(): Project[] {
  return [
    { id: rid(), name: "Core Platform", slug: "core-platform", environment: "production", createdAt: new Date(Date.now() - 86400000 * 90).toISOString(), requests: 842_103 },
    { id: rid(), name: "Customer Support AI", slug: "support-ai", environment: "production", createdAt: new Date(Date.now() - 86400000 * 45).toISOString(), requests: 312_409 },
    { id: rid(), name: "Internal Tools", slug: "internal-tools", environment: "staging", createdAt: new Date(Date.now() - 86400000 * 14).toISOString(), requests: 28_540 },
  ];
}

function seedKeys(): ApiKey[] {
  return [
    { id: rid(), name: "Production API", prefix: "orch_live_9a2f", scopes: ["read", "write"], createdAt: new Date(Date.now() - 86400000 * 30).toISOString(), lastUsedAt: new Date().toISOString() },
    { id: rid(), name: "Analytics Reader", prefix: "orch_live_b71e", scopes: ["read"], createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), lastUsedAt: new Date(Date.now() - 3600000).toISOString() },
  ];
}

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
    history: seedHistory(),
    projects: seedProjects(),
    keys: seedKeys(),
  });

export function getStore() {
  return store;
}

export function computeMetrics(): Metrics {
  const recent = store.history.slice(0, 100);
  const avgLatency = recent.reduce((s, h) => s + h.latencyMs, 0) / Math.max(recent.length, 1);
  const blocked = store.history.filter((h) => h.status === "blocked").length;
  return {
    totalRequests: 1_284_390 + store.history.length,
    avgLatencyMs: Math.round(avgLatency),
    costSavedUsd: Number((18_420 + store.history.reduce((s, h) => s + h.costUsd, 0)).toFixed(2)),
    threatsBlocked: 342 + blocked,
    healthPct: 99.98,
    updatedAt: new Date().toISOString(),
  };
}

export function newId() {
  return rid();
}
