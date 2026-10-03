import { createFileRoute } from "@tanstack/react-router";

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

function keyIdFromUrl(request: Request) {
  const pathname = new URL(request.url).pathname;
  const match = pathname.match(/^\/api\/keys\/([^/]+)$/);
  return match?.[1] ?? null;
}

export const Route = createFileRoute("/api/$")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const pathname = new URL(request.url).pathname;
        if (pathname === "/api/keys") return json({ error: "Customer API-key management is deferred" }, 410);
        return json({ error: "Not found" }, 404);
      },
      POST: async ({ request }) => {
        const pathname = new URL(request.url).pathname;
        if (pathname === "/api/keys") return json({ error: "Customer API-key management is deferred" }, 410);
        return json({ error: "Not found" }, 404);
      },
      DELETE: async ({ request }) => {
        if (keyIdFromUrl(request)) return json({ error: "Customer API-key management is deferred" }, 410);
        return json({ error: "Not found" }, 404);
      },
    },
  },
});
