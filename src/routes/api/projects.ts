import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

const createSchema = z.object({
  name: z.string().trim().min(1).max(80),
  environment: z.enum(["production", "staging", "development"]).default("development"),
});

export const Route = createFileRoute("/api/projects")({
  server: {
    handlers: {
      GET: async () => {
        const { getStore } = await import("@/lib/api-store.server");
        return json(getStore().projects);
      },
      POST: async ({ request }) => {
        const { getStore, newId } = await import("@/lib/api-store.server");
        const body = await request.json().catch(() => null);
        const parsed = createSchema.safeParse(body);
        if (!parsed.success) return json({ error: "Invalid input", details: parsed.error.flatten() }, 400);
        const project = {
          id: newId(),
          name: parsed.data.name,
          slug: parsed.data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
          environment: parsed.data.environment,
          createdAt: new Date().toISOString(),
          requests: 0,
        };
        getStore().projects.unshift(project);
        return json(project, 201);
      },
    },
  },
});
