import { createFileRoute } from "@tanstack/react-router";

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

export const Route = createFileRoute("/api/history")({
  server: {
    handlers: {
      GET: async () => {
        return json({ error: "This endpoint is retired. Use the authenticated /api/v1/history endpoint with a project context." }, 410);
      },
    },
  },
});
