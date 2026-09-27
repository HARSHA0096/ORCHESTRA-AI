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

const PLAYBOOKS_SEED: Playbook[] = [];

const SEED_EVENTS: { ts: string; desc: string; outcome: string }[] = [];

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
    setDrillRunning(false);
    toast.success("Drill complete; connect the backend to record results");
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
        <StatCard label="Auto Recoveries (24h)" value={String(events.length)} delta="No data" color="var(--neon-green)"  icon={RefreshCw} />
        <StatCard label="Mean Recovery"         value="—" delta="No data" color="var(--neon-cyan)"  icon={LifeBuoy} />
        <StatCard label="Uptime SLA"            value="—" delta="No data" color="var(--neon-violet)" icon={CheckCircle2} />
        <StatCard label="Circuits Open"         value="—"     delta="No data"   color="var(--neon-amber)"   icon={AlertTriangle} />
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
