import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

const demoEventSchema = z.object({
  model: z.string().max(120).optional(),
  latencyMs: z.number().nonnegative().max(120000).optional(),
  costUsd: z.number().nonnegative().max(100).optional(),
  inputTokens: z.number().int().nonnegative().max(100000).optional(),
  outputTokens: z.number().int().nonnegative().max(100000).optional(),
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
        if (pathname === "/api/demo-event") {
          const body = await request.json().catch(() => null);
          const parsed = demoEventSchema.safeParse(body);
          if (!parsed.success) return json({ error: "Invalid input" }, 400);
          const { recordDemoEvent } = await import("@/lib/api-store.server");
          return json(recordDemoEvent(parsed.data));
        }
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