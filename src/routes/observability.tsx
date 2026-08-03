import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHero, Panel, StatCard } from "@/components/app-shell";
import { Radar, Activity, Eye, TerminalSquare, Search, Pause, Play } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { useEffect, useMemo, useRef, useState } from "react";

export const Route = createFileRoute("/observability")({
  head: () => ({
    meta: [
      { title: "Observability — Orchestra AI" },
      { name: "description", content: "End-to-end traces, structured logs and live metrics across every AI call." },
    ],
  }),
  component: ObsPage,
});

type Log = { ts: string; lvl: "info" | "warn" | "error"; msg: string };

const SAMPLE_MSGS: Log[] = [
  { ts: "", lvl: "info",  msg: "req=8a3 model=gpt-4o tokens=1240 latency=412ms" },
  { ts: "", lvl: "warn",  msg: "fallback claude-3.5 (openai 5xx)" },
  { ts: "", lvl: "info",  msg: "cache hit prompt_hash=4f1c" },
  { ts: "", lvl: "error", msg: "rate_limit provider=openai retry_in=820ms" },
  { ts: "", lvl: "info",  msg: "trace span=embed dur=88ms" },
  { ts: "", lvl: "warn",  msg: "context_length=31k approaching window" },
];

const RANGES = { "5m": 30, "1h": 60, "24h": 96 } as const;
type RangeKey = keyof typeof RANGES;

function buildLatency(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    t: i,
    p50: 220 + Math.sin(i / 2) * 30 + Math.random() * 20,
    p95: 420 + Math.sin(i / 2 + 1) * 60 + Math.random() * 40,
    p99: 620 + Math.sin(i / 2 + 2) * 90 + Math.random() * 60,
  }));
}

const lvlColor = (lvl: string) => lvl === "error" ? "var(--neon-red)" : lvl === "warn" ? "var(--neon-amber)" : "var(--neon-cyan)";

function ObsPage() {
  const [range, setRange] = useState<RangeKey>("1h");
  const latency = useMemo(() => buildLatency(RANGES[range]), [range]);
  const [logs, setLogs] = useState<Log[]>(() => SAMPLE_MSGS.map((m, i) => ({ ...m, ts: stamp(-i * 50) })));
  const [lvlFilter, setLvlFilter] = useState<"all" | Log["lvl"]>("all");
  const [q, setQ] = useState("");
  const [paused, setPaused] = useState(false);
  const idx = useRef(0);

  useEffect(() => {
    if (paused) return;
    const i = window.setInterval(() => {
      const seed = SAMPLE_MSGS[idx.current++ % SAMPLE_MSGS.length];
      setLogs((s) => [{ ...seed, ts: stamp(0) }, ...s].slice(0, 80));
    }, 1600);
    return () => window.clearInterval(i);
  }, [paused]);

  const visible = logs.filter((l) => (lvlFilter === "all" || l.lvl === lvlFilter) && l.msg.toLowerCase().includes(q.toLowerCase()));

  return (
    <AppShell>
      <PageHero
        eyebrow="Telemetry · Realtime"
        title="Observability"
        subtitle="Spans, logs and metrics in one unified pane. Drill from anomalies to the exact request that caused them."
        accent="var(--neon-cyan)"
        actions={
          <div className="flex gap-1 rounded-md border border-white/10 bg-white/[0.03] p-0.5 text-[11px]">
            {(Object.keys(RANGES) as RangeKey[]).map((k) => (
              <button key={k} onClick={() => setRange(k)}
                      className={`rounded px-2 py-1 transition-colors ${range === k ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground"}`}>{k}</button>
            ))}
          </div>
        }
      />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Spans / sec"   value="8,412" delta="+12%"  color="var(--neon-cyan)"   icon={Radar} />
        <StatCard label="P95 Latency"   value="412ms" delta="-32ms" color="var(--neon-green)"  icon={Activity} />
        <StatCard label="Active Traces" value="284"   delta="+18"   color="var(--neon-violet)" icon={Eye} />
        <StatCard label="Logs / min"    value="12.4k" delta="+4%"   color="var(--neon-pink)"   icon={TerminalSquare} />
      </section>

      <Panel eyebrow="Latency" title={`P50 · P95 · P99 (ms) — ${range}`}>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={latency}>
            <XAxis dataKey="t" hide />
            <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
            <Tooltip contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="p50" stroke="var(--neon-cyan)"   strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="p95" stroke="var(--neon-violet)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="p99" stroke="var(--neon-pink)"   strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Panel>

      <Panel
        eyebrow="Stream"
        title="Live Logs"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex gap-1 rounded-md border border-white/10 bg-white/[0.03] p-0.5 text-[11px]">
              {(["all", "info", "warn", "error"] as const).map((k) => (
                <button key={k} onClick={() => setLvlFilter(k)}
                        className={`rounded px-2 py-1 capitalize ${lvlFilter === k ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground"}`}>{k}</button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="grep logs…"
                     className="h-8 w-48 rounded-md border border-white/10 bg-white/[0.03] pl-8 pr-3 text-xs focus:outline-none" />
            </div>
            <button onClick={() => setPaused((p) => !p)} className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-[11px] hover:bg-white/[0.07]">
              {paused ? <><Play className="h-3 w-3" /> Resume</> : <><Pause className="h-3 w-3" /> Pause</>}
            </button>
          </div>
        }
      >
        {visible.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/10 px-4 py-10 text-center text-sm text-muted-foreground">No logs match this filter.</div>
        ) : (
          <div className="max-h-[360px] space-y-1 overflow-y-auto font-mono text-[12.5px]">
            {visible.map((l, i) => (
              <div key={`${l.ts}-${i}`} className="flex items-start gap-3 rounded-md border border-white/5 bg-white/[0.02] px-3 py-2">
                <span className="shrink-0 text-muted-foreground">{l.ts}</span>
                <span className="w-12 shrink-0 rounded-md px-1.5 py-0.5 text-center text-[10px] uppercase" style={{ background: `${lvlColor(l.lvl)}1f`, color: lvlColor(l.lvl) }}>{l.lvl}</span>
                <span className="min-w-0 truncate">{l.msg}</span>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </AppShell>
  );
}

function stamp(offsetMs: number) {
  const d = new Date(Date.now() + offsetMs);
  return d.toTimeString().slice(0, 8) + "." + String(d.getMilliseconds()).padStart(3, "0");
}
