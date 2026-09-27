import { createFileRoute } from "@tanstack/react-router";

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

export const Route = createFileRoute("/api/history")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const base = (import.meta.env.VITE_BACKEND_URL as string | undefined) || "http://localhost:3001";
        try {
          const response = await fetch(`${base}/api/v1/demo/history`, { cache: "no-store" });
          if (response.ok) {
            const items = await response.json();
            const url = new URL(request.url);
            return json({ items, total: items.length, page: 1, pageSize: items.length });
          }
        } catch {}
        const { getStore } = await import("@/lib/api-store.server");
        const url = new URL(request.url);
        const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
        const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get("pageSize")) || 20));
        const items = getStore().history.map((item) => ({
          id: item.id, requestId: item.id, endpoint: "/v1/chat/completions", status: item.status === "blocked" ? "FAILED" : "SUCCESS",
          model: item.model, latencyMs: item.latencyMs, inputTokens: (item as any).inputTokens ?? 0, outputTokens: (item as any).outputTokens ?? 0, cost: item.costUsd, createdAt: item.timestamp,
        }));
        return json({ items, total: items.length, page, pageSize, source: "frontend-demo" });
      },
    },
  },
});
