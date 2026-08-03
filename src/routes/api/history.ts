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
        const { getStore } = await import("@/lib/api-store.server");
        const url = new URL(request.url);
        const q = (url.searchParams.get("q") ?? "").toLowerCase();
        const status = url.searchParams.get("status") ?? "all";
        const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
        const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get("pageSize")) || 20));

        let items = getStore().history;
        if (status !== "all") items = items.filter((i) => i.status === status);
        if (q) items = items.filter((i) => i.prompt.toLowerCase().includes(q) || i.model.toLowerCase().includes(q));
        const total = items.length;
        const paged = items.slice((page - 1) * pageSize, page * pageSize);
        return json({ items: paged, total, page, pageSize });
      },
    },
  },
});
