import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHero, Panel, StatCard, Modal, Btn } from "@/components/app-shell";
import { Router as RouterIcon, GitFork, Plus, Pencil, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/router")({
  head: () => ({
    meta: [
      { title: "Model Router — Orchestra AI" },
      { name: "description", content: "Smart routing rules send each request to the optimal model for cost, latency and quality." },
    ],
  }),
  component: RouterPage,
});

type Rule = {
  id: string; name: string;
  strategy: "cheapest-quality" | "context-aware" | "fastest" | "fallback" | "geo-pin";
  from: string; to: string; weight: number; hits: string; enabled: boolean;
};

const SEED: Rule[] = [];

const STORAGE = "orchestra.router.rules";
const STRATEGIES: Rule["strategy"][] = ["cheapest-quality", "context-aware", "fastest", "fallback", "geo-pin"];

function RouterPage() {
  const [rules, setRules] = useState<Rule[]>(SEED);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Rule | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Rule | null>(null);
  const [form, setForm] = useState<Omit<Rule, "id" | "hits">>({ name: "", strategy: "cheapest-quality", from: "*", to: "", weight: 100, enabled: true });

  useEffect(() => { try { const raw = window.localStorage.getItem(STORAGE); if (raw) setRules(JSON.parse(raw)); } catch { /* */ } }, []);
  useEffect(() => { window.localStorage.setItem(STORAGE, JSON.stringify(rules)); }, [rules]);

  const visible = useMemo(() => rules.filter((r) => r.name.toLowerCase().includes(q.toLowerCase()) || r.from.toLowerCase().includes(q.toLowerCase())), [rules, q]);
  const active = rules.filter((r) => r.enabled).length;

  const toggle = (id: string) => setRules((s) => s.map((r) => r.id === id ? { ...r, enabled: !r.enabled } : r));

  const startCreate = () => { setForm({ name: "", strategy: "cheapest-quality", from: "*", to: "", weight: 100, enabled: true }); setCreating(true); };
  const startEdit = (r: Rule) => { setForm({ name: r.name, strategy: r.strategy, from: r.from, to: r.to, weight: r.weight, enabled: r.enabled }); setEditing(r); };

  const submit = () => {
    if (!form.name.trim() || !form.to.trim()) { toast.error("Name and target are required"); return; }
    if (editing) {
      setRules((s) => s.map((r) => r.id === editing.id ? { ...r, ...form } : r));
      toast.success("Rule updated");
      setEditing(null);
    } else {
      setRules((s) => [{ id: `r${Date.now()}`, hits: "0", ...form }, ...s]);
      toast.success("Rule created");
      setCreating(false);
    }
  };
  const confirmDelete = () => {
    if (!deleting) return;
    setRules((s) => s.filter((r) => r.id !== deleting.id));
    toast.success(`Deleted "${deleting.name}"`);
    setDeleting(null);
  };

  return (
    <AppShell>
      <PageHero
        eyebrow="Routing · Adaptive"
        title="Model Router"
        subtitle="Define declarative routing strategies that pick the optimal model per request based on cost, latency, context length, region and quality signals."
        accent="var(--neon-violet)"
        actions={<Btn onClick={startCreate}><Plus className="h-4 w-4" /> New Rule</Btn>}
      />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Active Rules" value={String(active)} delta="Current" color="var(--neon-violet)" icon={GitFork} />
        <StatCard label="Routed (24h)" value="0" delta="No data" color="var(--neon-cyan)" icon={RouterIcon} />
        <StatCard label="Avg Decision" value="—" delta="No data" color="var(--neon-green)" icon={RouterIcon} />
        <StatCard label="Quality Score" value="—" delta="No data" color="var(--neon-pink)" icon={GitFork} />
      </section>

      <Panel
        eyebrow="Strategy"
        title="Routing Rules"
        actions={
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search rules…"
                 className="h-8 w-48 rounded-md border border-white/10 bg-white/[0.03] px-3 text-xs focus:outline-none" />
        }
      >
        {visible.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/10 px-4 py-12 text-center text-sm text-muted-foreground">No rules match your search.</div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-white/5">
            <table className="w-full text-sm">
              <thead className="bg-white/[0.03] text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                <tr><th className="px-3 py-2 text-left">Rule</th><th className="px-3 py-2 text-left">Strategy</th><th className="px-3 py-2 text-left">When</th><th className="px-3 py-2 text-left">Routes to</th><th className="px-3 py-2 text-right">Hits</th><th className="px-3 py-2 text-right">State</th><th className="px-3 py-2" /></tr>
              </thead>
              <tbody>
                {visible.map((r) => (
                  <tr key={r.id} className={`border-t border-white/5 transition-colors hover:bg-white/[0.02] ${!r.enabled ? "opacity-55" : ""}`}>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="grid h-7 w-7 place-items-center rounded-md bg-white/[0.04] text-[var(--neon-cyan)]"><GitFork className="h-3.5 w-3.5" /></span>
                        <span className="font-medium">{r.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-[12px] text-[var(--neon-violet)]">{r.strategy}</td>
                    <td className="px-3 py-2.5 font-mono text-[12px] text-muted-foreground">{r.from}</td>
                    <td className="px-3 py-2.5 font-mono text-[12px]">{r.to}</td>
                    <td className="px-3 py-2.5 text-right font-mono">{r.hits}</td>
                    <td className="px-3 py-2.5 text-right">
                      <button onClick={() => toggle(r.id)}
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${r.enabled ? "bg-[var(--neon-violet)]/60" : "bg-white/10"}`}>
                        <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${r.enabled ? "translate-x-4" : "translate-x-0.5"}`} />
                      </button>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <div className="inline-flex">
                        <button onClick={() => startEdit(r)} className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-white/5 hover:text-foreground" aria-label="Edit"><Pencil className="h-3.5 w-3.5" /></button>
                        <button onClick={() => setDeleting(r)} className="grid h-7 w-7 place-items-center rounded-md text-[var(--neon-red)] hover:bg-[oklch(0.7_0.25_25/0.12)]" aria-label="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Panel eyebrow="Visualization" title="Decision Flow">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {[
            { t: "Inspect", d: "Headers, body size, region, tags." },
            { t: "Score",   d: "Cost, latency, quality, residency." },
            { t: "Dispatch", d: "Best-fit provider with fallbacks ready." },
          ].map((s, i) => (
            <div key={s.t} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Step {i + 1}</div>
              <div className="mt-1 font-display text-lg font-semibold text-[var(--neon-cyan)]">{s.t}</div>
              <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </Panel>

      <Modal open={creating || !!editing} onClose={() => { setCreating(false); setEditing(null); }}
             title={editing ? `Edit · ${editing.name}` : "New routing rule"} size="lg"
             footer={<><Btn variant="secondary" onClick={() => { setCreating(false); setEditing(null); }}>Cancel</Btn><Btn onClick={submit}>{editing ? "Save" : "Create rule"}</Btn></>}>
        <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Field label="Name"><input autoFocus value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required maxLength={64}
                                     className="h-9 w-full rounded-md border border-white/10 bg-white/[0.03] px-3 text-sm focus:outline-none" /></Field>
          <Field label="Strategy">
            <select value={form.strategy} onChange={(e) => setForm({ ...form, strategy: e.target.value as Rule["strategy"] })}
                    className="h-9 w-full rounded-md border border-white/10 bg-white/[0.03] px-3 text-sm focus:outline-none">
              {STRATEGIES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Match (when)"><input value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} placeholder="e.g. tokens>32k"
                                              className="h-9 w-full rounded-md border border-white/10 bg-white/[0.03] px-3 font-mono text-sm focus:outline-none" /></Field>
          <Field label="Routes to"><input value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} required placeholder="GPT-4o → Claude 3.5"
                                          className="h-9 w-full rounded-md border border-white/10 bg-white/[0.03] px-3 font-mono text-sm focus:outline-none" /></Field>
          <Field label="Weight"><input type="number" min={1} max={100} value={form.weight} onChange={(e) => setForm({ ...form, weight: Number(e.target.value) })}
                                       className="h-9 w-full rounded-md border border-white/10 bg-white/[0.03] px-3 text-sm focus:outline-none" /></Field>
          <div className="flex items-end">
            <label className="flex w-full items-center justify-between rounded-md border border-white/10 bg-white/[0.03] p-2 text-sm">
              <span>Enabled</span>
              <input type="checkbox" checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} />
            </label>
          </div>
        </form>
      </Modal>

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Delete routing rule"
             description={`Remove "${deleting?.name}"?`}
             footer={<><Btn variant="secondary" onClick={() => setDeleting(null)}>Cancel</Btn><Btn variant="danger" onClick={confirmDelete}>Delete</Btn></>}>
        <div className="text-xs text-muted-foreground">Traffic currently matching this rule will fall through to the next priority rule.</div>
      </Modal>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="mb-1 block text-[11px] uppercase tracking-wider text-muted-foreground">{label}</label>{children}</div>;
}
