import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

const createKeySchema = z.object({
  name: z.string().trim().min(1).max(80),
  scopes: z.array(z.enum(["read", "write", "admin"])).min(1).default(["read"]),
});

const demoEventSchema = z.object({
  model: z.string().max(120).optional(),
  latencyMs: z.number().nonnegative().max(120000).optional(),
  costUsd: z.number().nonnegative().max(100).optional(),
  inputTokens: z.number().int().nonnegative().max(100000).optional(),
  outputTokens: z.number().int().nonnegative().max(100000).optional(),
});

function genPrefix() {
  return "orch_live_" + Math.random().toString(36).slice(2, 6);
}

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
        if (pathname !== "/api/keys") return json({ error: "Not found" }, 404);

        const { getStore } = await import("@/lib/api-store.server");
        return json(getStore().keys);
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
        if (pathname !== "/api/keys") return json({ error: "Not found" }, 404);

        const { getStore, newId } = await import("@/lib/api-store.server");
        const body = await request.json().catch(() => null);
        const parsed = createKeySchema.safeParse(body);
        if (!parsed.success) return json({ error: "Invalid input", details: parsed.error.flatten() }, 400);

        const prefix = genPrefix();
        const fullKey = `${prefix}_${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
        const key = {
          id: newId(),
          name: parsed.data.name,
          prefix,
          scopes: parsed.data.scopes,
          createdAt: new Date().toISOString(),
          lastUsedAt: null,
        };

        getStore().keys.unshift(key);
        return json({ ...key, key: fullKey }, 201);
      },
      DELETE: async ({ request }) => {
        const id = keyIdFromUrl(request);
        if (!id) return json({ error: "Not found" }, 404);

        const { getStore } = await import("@/lib/api-store.server");
        const store = getStore();
        const before = store.keys.length;
        store.keys = store.keys.filter((k) => k.id !== id);
        if (store.keys.length === before) return json({ error: "Not found" }, 404);
        return json({ ok: true });
      },
    },
  },
});