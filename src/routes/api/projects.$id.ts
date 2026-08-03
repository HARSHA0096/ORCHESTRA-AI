import { createFileRoute } from "@tanstack/react-router";

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

export const Route = createFileRoute("/api/projects/$id")({
  server: {
    handlers: {
      DELETE: async ({ params }) => {
        const { getStore } = await import("@/lib/api-store.server");
        const store = getStore();
        const before = store.projects.length;
        store.projects = store.projects.filter((p) => p.id !== params.id);
        if (store.projects.length === before) return json({ error: "Not found" }, 404);
        return json({ ok: true });
      },
    },
  },
});
