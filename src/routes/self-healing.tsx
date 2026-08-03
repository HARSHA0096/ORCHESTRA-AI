import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHero, Panel, StatCard, Btn } from "@/components/app-shell";
import { LifeBuoy, RefreshCw, CheckCircle2, AlertTriangle, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/self-healing")({
  head: () => ({
    meta: [
      { title: "Self-Healing — Orchestra AI" },
      { name: "description", content: "Automatic retries, fallbacks and circuit breakers keep your AI workloads online without human intervention." },
    ],
  }),
  component: SelfHealingPage,
});

type Playbook = { t: string; d: string; on: boolean };

const PLAYBOOKS_SEED: Playbook[] = [
  { t: "Retry w/ Backoff",    d: "Exponential 100ms → 2s, up to 5 attempts.", on: true },
  { t: "Provider Fallback",   d: "Auto-switch to next best provider in chain.", on: true },
  { t: "Circuit Breaker",     d: "Open after 5 failures, half-open after 60s.", on: true },
  { t: "Regional Failover",   d: "Cross-region request rerouting.", on: true },
  { t: "Cache Substitution",  d: "Serve cached responses when upstream is down.", on: true },
  { t: "Degraded Mode",       d: "Drop to smaller, faster model under stress.", on: false },
];

const SEED_EVENTS = [
  { ts: "14:04:12", desc: "OpenAI 5xx burst — failed-over to Claude 3.5 for 14s", outcome: "recovered" },
  { ts: "13:51:02", desc: "Embedding latency spike — switched region us-east → eu-west", outcome: "recovered" },
  { ts: "13:32:41", desc: "Gemini quota near limit — throttled non-critical calls",  outcome: "mitigated" },
  { ts: "13:11:08", desc: "DeepSeek connection refused — circuit opened 60s",        outcome: "recovered" },
  { ts: "12:58:50", desc: "Rate limit on /chat — backoff & retry 3x",                outcome: "recovered" },
];

function SelfHealingPage() {
  const [playbooks, setPlaybooks] = useState<Playbook[]>(PLAYBOOKS_SEED);
  const [events, setEvents] = useState(SEED_EVENTS);
  const [drillRunning, setDrillRunning] = useState(false);

  useEffect(() => { try { const raw = window.localStorage.getItem("orchestra.playbooks"); if (raw) setPlaybooks(JSON.parse(raw)); } catch { /* */ } }, []);
  useEffect(() => { window.localStorage.setItem("orchestra.playbooks", JSON.stringify(playbooks)); }, [playbooks]);

  const togglePlaybook = (t: string) => {
    setPlaybooks((s) => s.map((p) => p.t === t ? { ...p, on: !p.on } : p));
    const p = playbooks.find((x) => x.t === t)!;
    toast.success(`${p.t} ${p.on ? "disabled" : "enabled"}`);
  };
  const runDrill = async () => {
    setDrillRunning(true);
    toast.message("Failover drill started…");
    await new Promise((r) => setTimeout(r, 1400));
    const now = new Date();
    const ts = now.toTimeString().slice(0, 8);
    setEvents((s) => [{ ts, desc: "Manual drill — synthetic failover succeeded in 412ms", outcome: "recovered" }, ...s]);
    setDrillRunning(false);
    toast.success("Drill complete · 412ms recovery");
  };

  return (
    <AppShell>
      <PageHero
        eyebrow="Resilience · Autonomous"
        title="Self-Healing Engine"
        subtitle="Detect provider failures in milliseconds and reroute around them. Circuit breakers, exponential backoff and intelligent fallbacks keep traffic flowing."
        accent="var(--neon-green)"
        actions={
          <Btn onClick={runDrill} disabled={drillRunning}>
            <Play className={`h-4 w-4 ${drillRunning ? "animate-pulse" : ""}`} /> {drillRunning ? "Running drill…" : "Run failover drill"}
          </Btn>
        }
      />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Auto Recoveries (24h)" value={String(184 + events.length - SEED_EVENTS.length)} delta="+18%" color="var(--neon-green)"  icon={RefreshCw} />
        <StatCard label="Mean Recovery"         value="412ms" delta="-92ms" color="var(--neon-cyan)"  icon={LifeBuoy} />
        <StatCard label="Uptime SLA"            value="99.99%" delta="+0.02%" color="var(--neon-violet)" icon={CheckCircle2} />
        <StatCard label="Circuits Open"         value="0"     delta="-2"   color="var(--neon-amber)"   icon={AlertTriangle} />
      </section>

      <Panel eyebrow="Timeline" title="Recovery Events">
        <ol className="relative ml-3 border-l border-white/10">
          {events.map((e, i) => (
            <li key={`${e.ts}-${i}`} className="mb-4 ml-4">
              <span className="absolute -left-1.5 mt-1 h-3 w-3 rounded-full animate-pulse-dot"
                    style={{ background: "var(--neon-green)", color: "var(--neon-green)" }} />
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[11px] text-muted-foreground">{e.ts}</span>
                <span className="rounded-md bg-[oklch(0.85_0.21_155/0.12)] px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-[var(--neon-green)]">{e.outcome}</span>
              </div>
              <div className="mt-1 text-sm">{e.desc}</div>
            </li>
          ))}
        </ol>
      </Panel>

      <Panel eyebrow="Strategies" title="Active Recovery Playbooks">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {playbooks.map((s) => (
            <div key={s.t} className={`rounded-xl border bg-white/[0.03] p-4 transition-all ${s.on ? "border-[var(--neon-green)]/30" : "border-white/10 opacity-60"}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="font-display text-base font-semibold" style={{ color: s.on ? "var(--neon-green)" : undefined }}>{s.t}</div>
                <button onClick={() => togglePlaybook(s.t)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${s.on ? "bg-[var(--neon-green)]/60" : "bg-white/10"}`}>
                  <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${s.on ? "translate-x-4" : "translate-x-0.5"}`} />
                </button>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </Panel>
    </AppShell>
  );
}
