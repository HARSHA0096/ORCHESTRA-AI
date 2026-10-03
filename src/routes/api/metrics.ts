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
        return json({ error: "This endpoint is retired. Use the authenticated /api/v1/metrics endpoint with a project context." }, 410);
      },
    },
  },
});
