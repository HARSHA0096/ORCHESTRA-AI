import { createFileRoute } from "@tanstack/react-router";

type HistoryItemWithTokens = { inputTokens?: number; outputTokens?: number };

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

export const Route = createFileRoute("/api/metrics")({
  server: {
    handlers: {
      GET: async () => {
        const base = (import.meta.env.VITE_BACKEND_URL as string | undefined) || "http://localhost:3001";
        try {
          const response = await fetch(`${base}/api/v1/demo/metrics`, { cache: "no-store" });
          if (response.ok) return json(await response.json());
        } catch {}
        const { computeMetrics, getStore } = await import("@/lib/api-store.server");
        const local = computeMetrics();
        const history = getStore().history;
        const totalTokens = history.reduce((sum, item) => sum + ((item as HistoryItemWithTokens).inputTokens ?? 0) + ((item as HistoryItemWithTokens).outputTokens ?? 0), 0);
        const successful = history.filter((item) => item.status === "completed" || item.status === "routed").length;
        return json({
          totalRequests: local.totalRequests, successful, failed: Math.max(0, local.totalRequests - successful), recovered: history.filter((item) => item.status === "recovered").length,
          totalCost: Number(history.reduce((sum, item) => sum + item.costUsd, 0).toFixed(6)), avgLatencyMs: local.avgLatencyMs,
          avgTokens: local.totalRequests ? Math.round(totalTokens / local.totalRequests) : 0, blockedRequests: local.threatsBlocked, activeModels: local.totalRequests ? 1 : 0,
          recoveryRate: local.totalRequests ? Number(((history.filter((item) => item.status === "recovered").length / local.totalRequests) * 100).toFixed(1)) : 0,
          gatewayHealth: local.totalRequests ? Number(((successful / local.totalRequests) * 100).toFixed(1)) : 0,
          updatedAt: local.updatedAt, source: "frontend-demo",
        });
      },
    },
  },
});
