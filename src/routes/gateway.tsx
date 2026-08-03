import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHero, Panel, StatCard, Modal, Btn } from "@/components/app-shell";
import { Network, Zap, Globe2, ShieldCheck, Cpu, Search } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/gateway")({
  head: () => ({
    meta: [
      { title: "Gateway — Orchestra AI" },
      { name: "description", content: "Universal AI gateway with intelligent routing, caching and policy enforcement." },
    ],
  }),
  component: GatewayPage,
});

const throughput = Array.from({ length: 36 }, (_, i) => ({
  t: i,
  in: 600 + Math.sin(i / 3) * 200 + Math.random() * 120,
  out: 540 + Math.sin(i / 3 + 1) * 180 + Math.random() * 110,
}));

type Endpoint = { path: string; reqs: string; p95: string; err: string };

const endpoints: Endpoint[] = [
  { path: "/v1/chat/completions",   reqs: "284,910", p95: "412ms", err: "0.02%" },
  { path: "/v1/embeddings",         reqs: "82,184",  p95: "188ms", err: "0.01%" },
  { path: "/v1/images/generations", reqs: "12,402",  p95: "2.1s",  err: "0.12%" },
  { path: "/v1/audio/speech",       reqs: "8,910",   p95: "612ms", err: "0.04%" },
  { path: "/v1/moderations",        reqs: "44,210",  p95: "92ms",  err: "0.00%" },
];

type SortKey = "reqs" | "p95" | "err" | "path";

function GatewayPage() {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<{ k: SortKey; dir: "asc" | "desc" }>({ k: "reqs", dir: "desc" });
  const [open, setOpen] = useState<Endpoint | null>(null);

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

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Requests / sec" value="1,284" delta="+12.4%" color="var(--neon-cyan)"   icon={Zap} />
        <StatCard label="Edge Regions"   value="14"    delta="+1"     color="var(--neon-violet)" icon={Globe2} />
        <StatCard label="Cache Hit Rate" value="38.4%" delta="+4.1%"  color="var(--neon-green)"  icon={Network} />
        <StatCard label="Policies Active" value="24"   delta="+3"     color="var(--neon-pink)"   icon={ShieldCheck} />
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
