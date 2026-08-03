import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHero, Panel, StatCard, Modal, Btn } from "@/components/app-shell";
import { Shield, ShieldAlert, ShieldCheck, Lock, AlertTriangle, Eye, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/security")({
  head: () => ({
    meta: [
      { title: "Security Center — Orchestra AI" },
      { name: "description", content: "Real-time threat detection, prompt injection defense and policy enforcement for enterprise AI." },
    ],
  }),
  component: SecurityPage,
});

type Threat = { id: string; type: string; source: string; severity: "high" | "medium" | "low"; blocked: boolean; ts: string };
type Policy = { name: string; coverage: number; enforced: boolean };

const SEED: Threat[] = [
  { id: "t1", type: "Prompt Injection",  source: "192.0.2.41",  severity: "high",   blocked: true,  ts: "14:02:18" },
  { id: "t2", type: "PII Leak Attempt",  source: "internal:api",severity: "high",   blocked: true,  ts: "14:01:42" },
  { id: "t3", type: "Jailbreak Pattern", source: "203.0.113.9", severity: "medium", blocked: true,  ts: "13:58:09" },
  { id: "t4", type: "Rate Anomaly",      source: "198.51.100.7",severity: "low",    blocked: false, ts: "13:54:51" },
  { id: "t5", type: "Unsafe Output",     source: "model:gpt-4o",severity: "medium", blocked: true,  ts: "13:49:12" },
];

const POLICIES_SEED: Policy[] = [
  { name: "PII Redaction",            coverage: 100, enforced: true },
  { name: "Prompt Injection Shield",  coverage: 98,  enforced: true },
  { name: "Data Loss Prevention",     coverage: 92,  enforced: true },
  { name: "Output Moderation",        coverage: 96,  enforced: true },
  { name: "Allowlist / Blocklist",    coverage: 100, enforced: true },
];

const sevColor = (s: string) => s === "high" ? "var(--neon-red)" : s === "medium" ? "var(--neon-amber)" : "var(--neon-cyan)";

function SecurityPage() {
  const [threats, setThreats] = useState<Threat[]>(SEED);
  const [policies, setPolicies] = useState<Policy[]>(POLICIES_SEED);
  const [sev, setSev] = useState<"all" | Threat["severity"]>("all");
  const [open, setOpen] = useState<Threat | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);

  const visible = useMemo(() => sev === "all" ? threats : threats.filter((t) => t.severity === sev), [threats, sev]);

  const dismiss = (id: string) => {
    setThreats((s) => s.filter((t) => t.id !== id));
    toast.success("Threat acknowledged");
  };
  const togglePolicy = (name: string) => {
    setPolicies((s) => s.map((p) => p.name === name ? { ...p, enforced: !p.enforced } : p));
    const p = policies.find((x) => x.name === name)!;
    toast.success(`${p.name} ${p.enforced ? "disabled" : "enforced"}`);
  };

  return (
    <AppShell>
      <PageHero
        eyebrow="Defense · Real-time"
        title="Security Center"
        subtitle="Continuously monitor prompts, responses and identities. Block injection attacks, redact PII and enforce policy across every model call."
        accent="var(--neon-pink)"
      />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Threats Blocked (24h)" value="1,284" delta="+12%" color="var(--neon-red)" icon={ShieldAlert} />
        <StatCard label={`Active Policies`}     value={String(policies.filter((p) => p.enforced).length)} color="var(--neon-violet)" icon={ShieldCheck} />
        <StatCard label="Coverage"              value="98.6%" delta="+0.4%" color="var(--neon-green)" icon={Shield} />
        <StatCard label="Risk Score"            value="Low"   delta="-2"   color="var(--neon-cyan)" icon={Lock} />
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
        <Panel
          eyebrow="Live Feed"
          title="Threat Stream"
          actions={
            <div className="flex gap-1 rounded-md border border-white/10 bg-white/[0.03] p-0.5 text-[11px]">
              {(["all", "high", "medium", "low"] as const).map((k) => (
                <button key={k} onClick={() => setSev(k)}
                        className={`rounded px-2 py-1 capitalize transition-colors ${sev === k ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground"}`}>{k}</button>
              ))}
            </div>
          }
        >
          {visible.length === 0 ? (
            <div className="rounded-lg border border-dashed border-white/10 px-4 py-10 text-center">
              <ShieldCheck className="mx-auto h-8 w-8 text-[var(--neon-green)]/70" />
              <div className="mt-2 text-sm font-medium">No threats in view</div>
              <div className="text-xs text-muted-foreground">Your defenses are quiet right now.</div>
            </div>
          ) : (
            <div className="space-y-2">
              {visible.map((t) => (
                <div key={t.id} className="group flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3 transition-colors hover:bg-white/[0.04]">
                  <div className="grid h-9 w-9 place-items-center rounded-lg" style={{ background: `${sevColor(t.severity)}1f`, color: sevColor(t.severity) }}>
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <button onClick={() => setOpen(t)} className="min-w-0 flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{t.type}</span>
                      <span className="rounded-md border border-white/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wider" style={{ color: sevColor(t.severity) }}>{t.severity}</span>
                    </div>
                    <div className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">from {t.source} · {t.ts}</div>
                  </button>
                  <span className={`rounded-md px-2 py-0.5 text-[11px] ${t.blocked ? "bg-[oklch(0.7_0.25_25/0.18)] text-[var(--neon-red)]" : "bg-[oklch(0.83_0.17_80/0.18)] text-[var(--neon-amber)]"}`}>
                    {t.blocked ? "blocked" : "flagged"}
                  </span>
                  <button onClick={() => dismiss(t.id)} aria-label="Dismiss" className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:bg-white/5 hover:text-foreground group-hover:opacity-100">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel eyebrow="Posture" title="Active Policies">
          <div className="space-y-3">
            {policies.map((p) => (
              <div key={p.name}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <button onClick={() => togglePolicy(p.name)} className="group flex items-center gap-2 font-medium hover:text-[var(--neon-cyan)]">
                    <span className={`inline-block h-1.5 w-1.5 rounded-full ${p.enforced ? "bg-[var(--neon-green)]" : "bg-white/20"}`} />
                    {p.name}
                    <span className={`rounded px-1 py-0.5 text-[9px] uppercase tracking-wider ${p.enforced ? "text-[var(--neon-green)]" : "text-muted-foreground"}`}>
                      {p.enforced ? "enforced" : "off"}
                    </span>
                  </button>
                  <span className="font-mono text-muted-foreground">{p.coverage}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                  <div className="h-full rounded-full transition-all" style={{
                    width: p.enforced ? `${p.coverage}%` : "0%",
                    background: "var(--gradient-violet-cyan)",
                    boxShadow: "0 0 10px var(--neon-violet)",
                  }} />
                </div>
              </div>
            ))}
            <button onClick={() => setEditorOpen(true)} className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] py-2 text-xs text-muted-foreground hover:bg-white/[0.06] hover:text-foreground">
              <Eye className="h-3.5 w-3.5" /> Open Policy Editor
            </button>
          </div>
        </Panel>
      </section>

      <Modal open={!!open} onClose={() => setOpen(null)} title="Threat detail"
             footer={<><Btn variant="secondary" onClick={() => setOpen(null)}>Close</Btn>{open && <Btn onClick={() => { dismiss(open.id); setOpen(null); }}>Acknowledge</Btn>}</>}>
        {open && (
          <div className="space-y-2 text-sm">
            <Row k="Type" v={open.type} />
            <Row k="Severity" v={open.severity} />
            <Row k="Source" v={open.source} mono />
            <Row k="Status" v={open.blocked ? "Blocked" : "Flagged"} />
            <Row k="Detected at" v={open.ts} mono />
            <div className="mt-2 rounded-lg border border-white/5 bg-white/[0.02] p-3 text-xs text-muted-foreground">
              Signal matched on the request payload. Full trace is available in the History module.
            </div>
          </div>
        )}
      </Modal>

      <Modal open={editorOpen} onClose={() => setEditorOpen(false)} title="Policy editor" size="lg"
             description="Toggle which controls are enforced workspace-wide."
             footer={<Btn onClick={() => setEditorOpen(false)}>Done</Btn>}>
        <div className="space-y-2">
          {policies.map((p) => (
            <div key={p.name} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-3">
              <div>
                <div className="font-medium">{p.name}</div>
                <div className="text-xs text-muted-foreground">Coverage {p.coverage}%</div>
              </div>
              <button onClick={() => togglePolicy(p.name)}
                      className={`rounded-md px-3 py-1 text-xs ${p.enforced ? "bg-[oklch(0.85_0.21_155/0.15)] text-[var(--neon-green)]" : "bg-white/5 text-muted-foreground"}`}>
                {p.enforced ? "enforced" : "off"}
              </button>
            </div>
          ))}
        </div>
      </Modal>
    </AppShell>
  );
}

function Row({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex justify-between border-b border-white/5 py-1.5">
      <span className="text-muted-foreground">{k}</span>
      <span className={mono ? "font-mono text-[12.5px]" : ""}>{v}</span>
    </div>
  );
}
