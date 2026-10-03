import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHero, Panel, StatCard, Modal, Btn } from "@/components/app-shell";
import { Network, Zap, Globe2, ShieldCheck, Cpu, Search, Send, Loader2, Radio } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useMemo, useState } from "react";
import { api, session } from "@/lib/api";

export const Route = createFileRoute("/gateway")({
  head: () => ({
    meta: [
      { title: "Gateway — Orchestra AI" },
      { name: "description", content: "Universal AI gateway with intelligent routing, caching and policy enforcement." },
    ],
  }),
  component: GatewayPage,
});

const throughput: { t: number; in: number; out: number }[] = [];

type Endpoint = { path: string; reqs: string; p95: string; err: string };

const endpoints: Endpoint[] = [];

type SortKey = "reqs" | "p95" | "err" | "path";

function GatewayPage() {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<{ k: SortKey; dir: "asc" | "desc" }>({ k: "reqs", dir: "desc" });
  const [open, setOpen] = useState<Endpoint | null>(null);
  const [prompt, setPrompt] = useState("Explain how ORCHESTRA AI works");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const visible = useMemo(() => {
    const num = (s: string) => parseFloat(s.replace(/[,%a-z]/g, ""));
    const list = endpoints.filter((e) => e.path.toLowerCase().includes(q.toLowerCase()));
    list.sort((a, b) => {
      const va: number | string = sort.k === "path" ? a.path : num(a[sort.k]);
      const vb: number | string = sort.k === "path" ? b.path : num(b[sort.k]);
      const cmp = va > vb ? 1 : va < vb ? -1 : 0;
      return sort.dir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [q, sort]);

  const toggleSort = (k: SortKey) => setSort((s) => ({ k, dir: s.k === k && s.dir === "desc" ? "asc" : "desc" }));

  return (
    <AppShell>
      <PageHero
        eyebrow="Edge · Worldwide"
        title="AI Gateway"
        subtitle="A single OpenAI-compatible endpoint with intelligent routing, response caching, retries, fallbacks and policy enforcement at the edge."
        accent="var(--neon-cyan)"
      />

      <Panel eyebrow="Live Gateway" title="Try an AI Request" actions={<span className="inline-flex items-center gap-1.5 rounded-md bg-white/[0.04] px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground"><Radio className="h-3 w-3" /> Demo provider selected</span>}>
        <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4} className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.03] p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--neon-violet)]" placeholder="Ask ORCHESTRA anything…" />
          <div className="flex flex-col justify-between gap-3">
            <button disabled={loading || !prompt.trim()} onClick={async () => {
              setLoading(true); setError(""); setResponse("");
              try {
                if (!session.projectId) throw new Error("Select a project before sending a gateway request.");
                const result = await api.post<any>("/api/v1/gateway/", { prompt: prompt.trim(), provider: "demo", model: "orchestra-demo-model", projectId: session.projectId, requestType: "chat", streaming: false });
                setResponse(`${result.response ?? result.content ?? "No response returned."}\n\nRequest ID: ${result.requestId ?? "—"}\nProvider: ${result.provider ?? "demo"}\nModel: ${result.model ?? "orchestra-demo-model"}\nLatency: ${result.latencyMs ?? "—"} ms\nTokens: ${result.usage?.totalTokens ?? "—"}\nEstimated cost: ${result.cost ?? result.estimatedCost ?? "—"}\nRouting/security: ${result.metadata ? JSON.stringify(result.metadata) : "Not provided by backend"}`);
              } catch (e) { setError(e instanceof Error ? e.message : "Gateway request failed. Check the API connection."); }
              finally { setLoading(false); }
            }} className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-[oklch(0.16_0.04_270)] disabled:opacity-50" style={{ background: "var(--gradient-violet-cyan)" }}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} {loading ? "Running…" : "Send request"}
            </button>
          </div>
        </div>
        {(response || error) && <div className={`mt-3 rounded-lg border p-3 text-sm whitespace-pre-wrap ${error ? "border-[var(--neon-red)]/30 text-[var(--neon-red)]" : "border-white/10 bg-white/[0.02]"}`}>{error || response}</div>}
      </Panel>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Requests / sec" value="0" delta="No data" color="var(--neon-cyan)"   icon={Zap} />
        <StatCard label="Edge Regions"   value="—"    delta="No data"     color="var(--neon-violet)" icon={Globe2} />
        <StatCard label="Cache Hit Rate" value="—" delta="No data"  color="var(--neon-green)"  icon={Network} />
        <StatCard label="Policies Active" value="0"   delta="No data"     color="var(--neon-pink)"   icon={ShieldCheck} />
      </section>

      <Panel eyebrow="Throughput" title="Inbound vs Outbound (req/s)">
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={throughput}>
            <defs>
              <linearGradient id="gIn" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="var(--neon-cyan)" stopOpacity={0.5} /><stop offset="100%" stopColor="var(--neon-cyan)" stopOpacity={0} /></linearGradient>
              <linearGradient id="gOut" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="var(--neon-violet)" stopOpacity={0.5} /><stop offset="100%" stopColor="var(--neon-violet)" stopOpacity={0} /></linearGradient>
            </defs>
            <XAxis dataKey="t" hide /><YAxis hide />
            <Tooltip contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8 }} />
            <Area type="monotone" dataKey="in"  stroke="var(--neon-cyan)"   fill="url(#gIn)"  strokeWidth={2} />
            <Area type="monotone" dataKey="out" stroke="var(--neon-violet)" fill="url(#gOut)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </Panel>

      <Panel
        eyebrow="API"
        title="Endpoint Performance"
        actions={
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter endpoints…"
                   className="h-8 w-52 rounded-md border border-white/10 bg-white/[0.03] pl-8 pr-3 text-xs focus:outline-none" />
          </div>
        }
      >
        {visible.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/10 px-4 py-10 text-center text-sm text-muted-foreground">No endpoints match.</div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-white/5">
            <table className="w-full text-sm">
              <thead className="bg-white/[0.03] text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left"><SortBtn k="path" sort={sort} onClick={toggleSort}>Endpoint</SortBtn></th>
                  <th className="px-3 py-2 text-right"><SortBtn k="reqs" sort={sort} onClick={toggleSort}>Requests</SortBtn></th>
                  <th className="px-3 py-2 text-right"><SortBtn k="p95"  sort={sort} onClick={toggleSort}>P95</SortBtn></th>
                  <th className="px-3 py-2 text-right"><SortBtn k="err"  sort={sort} onClick={toggleSort}>Error rate</SortBtn></th>
                  <th className="px-3 py-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((e) => (
                  <tr key={e.path} onClick={() => setOpen(e)} className="cursor-pointer border-t border-white/5 transition-colors hover:bg-white/[0.03]">
                    <td className="px-3 py-2.5 font-mono text-[12.5px] text-foreground"><Cpu className="mr-2 inline h-3.5 w-3.5 text-[var(--neon-cyan)]" />{e.path}</td>
                    <td className="px-3 py-2.5 text-right font-mono">{e.reqs}</td>
                    <td className="px-3 py-2.5 text-right font-mono">{e.p95}</td>
                    <td className="px-3 py-2.5 text-right font-mono text-[var(--neon-green)]">{e.err}</td>
                    <td className="px-3 py-2.5 text-right">
                      <span className="inline-flex items-center gap-1 rounded-md bg-[oklch(0.85_0.21_155/0.12)] px-1.5 py-0.5 text-[11px] text-[var(--neon-green)]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--neon-green)] animate-pulse-dot" /> healthy
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Modal open={!!open} onClose={() => setOpen(null)} title="Endpoint" footer={<Btn onClick={() => setOpen(null)}>Close</Btn>}>
        {open && (
          <div className="space-y-2 text-sm">
            <div className="font-mono text-[var(--neon-cyan)]">{open.path}</div>
            <Row k="Requests (24h)" v={open.reqs} />
            <Row k="P95 latency" v={open.p95} />
            <Row k="Error rate" v={open.err} />
            <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3 text-xs text-muted-foreground">
              Region failover and cache hit-rate detail available in Observability for this endpoint.
            </div>
          </div>
        )}
      </Modal>
    </AppShell>
  );
}

function SortBtn({ k, sort, onClick, children }: { k: SortKey; sort: { k: SortKey; dir: "asc" | "desc" }; onClick: (k: SortKey) => void; children: React.ReactNode }) {
  const active = sort.k === k;
  return (
    <button onClick={() => onClick(k)} className={`inline-flex items-center gap-1 ${active ? "text-foreground" : "hover:text-foreground"}`}>
      {children}{active && <span>{sort.dir === "asc" ? "↑" : "↓"}</span>}
    </button>
  );
}
function Row({ k, v }: { k: string; v: string }) { return <div className="flex justify-between border-b border-white/5 py-1.5"><span className="text-muted-foreground">{k}</span><span className="font-mono">{v}</span></div>; }
