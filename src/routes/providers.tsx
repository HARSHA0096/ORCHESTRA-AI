import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHero, Panel, StatCard, Modal, Btn } from "@/components/app-shell";
import { Plug, Plus, CheckCircle2, Settings as SettingsIcon, Search, Activity, AlertTriangle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/providers")({
  head: () => ({
    meta: [
      { title: "Providers — Orchestra AI" },
      { name: "description", content: "Connect, monitor and benchmark every AI provider from one console." },
    ],
  }),
  component: ProvidersPage,
});

type Provider = {
  id: string; name: string; models: number; latency: number; uptime: number; cost: string;
  enabled: boolean; color: string; key?: string;
};

const SEED: Provider[] = [];

const STORAGE = "orchestra.providers";

function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>(SEED);
  const [q, setQ] = useState("");
  const [connectOpen, setConnectOpen] = useState(false);
  const [configuring, setConfiguring] = useState<Provider | null>(null);
  const [disconnecting, setDisconnecting] = useState<Provider | null>(null);
  const [testing, setTesting] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", key: "" });
  const [cfg, setCfg] = useState({ key: "", cost: "", enabled: true });

  useEffect(() => {
    try { const raw = window.localStorage.getItem(STORAGE); if (raw) setProviders(JSON.parse(raw)); } catch { /* */ }
  }, []);
  useEffect(() => { window.localStorage.setItem(STORAGE, JSON.stringify(providers)); }, [providers]);

  const visible = useMemo(() => providers.filter((p) => p.name.toLowerCase().includes(q.toLowerCase())), [providers, q]);

  const toggle = (id: string) => {
    setProviders((s) => s.map((p) => p.id === id ? { ...p, enabled: !p.enabled } : p));
    const p = providers.find((x) => x.id === id)!;
    toast.success(`${p.name} ${p.enabled ? "disabled" : "enabled"}`);
  };
  const openConfig = (p: Provider) => {
    setCfg({ key: p.key ?? "", cost: p.cost, enabled: p.enabled });
    setConfiguring(p);
  };
  const saveConfig = () => {
    if (!configuring) return;
    setProviders((s) => s.map((p) => p.id === configuring.id ? { ...p, key: cfg.key, cost: cfg.cost || p.cost, enabled: cfg.enabled } : p));
    toast.success(`${configuring.name} configuration saved`);
    setConfiguring(null);
  };
  const test = async (p: Provider) => {
    setTesting(p.id);
    await new Promise((r) => setTimeout(r, 900));
    setTesting(null);
    toast.success(`${p.name} reachable · ${p.latency}ms`);
  };
  const submitConnect = () => {
    const name = form.name.trim();
    if (!name) { toast.error("Provider name is required"); return; }
    if (!form.key.trim()) { toast.error("API key is required"); return; }
    const id = name.toLowerCase().replace(/\s+/g, "-");
    if (providers.some((p) => p.id === id)) { toast.error("Provider already connected"); return; }
    setProviders((s) => [{
      id, name, models: 1, latency: 0, uptime: 100, cost: "—", enabled: true,
      color: "var(--neon-cyan)", key: form.key,
    }, ...s]);
    toast.success(`Connected ${name}`);
    setForm({ name: "", key: "" });
    setConnectOpen(false);
  };
  const disconnect = () => {
    if (!disconnecting) return;
    setProviders((s) => s.filter((p) => p.id !== disconnecting.id));
    toast.success(`${disconnecting.name} disconnected`);
    setDisconnecting(null);
  };

  const connected = providers.filter((p) => p.enabled).length;
  const bestLatency = providers.filter((p) => p.enabled && p.latency > 0).reduce((m, p) => Math.min(m, p.latency), Infinity);
  const avgUptime = providers.length ? (providers.reduce((s, p) => s + p.uptime, 0) / providers.length).toFixed(2) : "0";
  const totalModels = providers.reduce((s, p) => s + p.models, 0);

  return (
    <AppShell>
      <PageHero
        eyebrow="Catalog · Multi-cloud"
        title="Providers"
        subtitle="Plug-and-play access to every major LLM provider, plus self-hosted endpoints. Benchmark, route and govern from one place."
        accent="var(--neon-pink)"
        actions={<Btn onClick={() => setConnectOpen(true)}><Plus className="h-4 w-4" /> Connect Provider</Btn>}
      />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Connected"    value={String(connected)} color="var(--neon-violet)" icon={Plug} />
        <StatCard label="Models Total" value={String(totalModels)} color="var(--neon-cyan)" icon={CheckCircle2} />
        <StatCard label="Best Latency" value={isFinite(bestLatency) ? `${bestLatency}ms` : "—"} color="var(--neon-green)" />
        <StatCard label="Avg Uptime"   value={`${avgUptime}%`} color="var(--neon-pink)" />
      </section>

      <Panel
        eyebrow="Fleet"
        title="Provider Health"
        actions={
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search providers…"
                   className="h-8 w-48 rounded-md border border-white/10 bg-white/[0.03] pl-8 pr-3 text-xs focus:outline-none" />
          </div>
        }
      >
        {visible.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/10 px-4 py-12 text-center">
            <Plug className="mx-auto h-8 w-8 text-muted-foreground/50" />
            <div className="mt-3 font-display text-sm font-medium">No providers found</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {visible.map((p) => (
              <div key={p.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-all hover:-translate-y-0.5 hover:border-white/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-lg font-display text-sm font-bold text-[oklch(0.16_0.04_270)]"
                         style={{ background: p.color }}>{p.name[0]}</div>
                    <div>
                      <div className="font-display text-base font-semibold">{p.name}</div>
                      <div className="text-[11px] text-muted-foreground">{p.models} models · {p.cost}</div>
                    </div>
                  </div>
                  <Toggle on={p.enabled} onChange={() => toggle(p.id)} />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-md bg-white/[0.03] p-2">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Latency</div>
                    <div className="mt-0.5 font-mono">{p.latency || "—"}{p.latency ? "ms" : ""}</div>
                  </div>
                  <div className="rounded-md bg-white/[0.03] p-2">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Uptime</div>
                    <div className="mt-0.5 font-mono text-[var(--neon-green)]">{p.uptime}%</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-[10px] uppercase tracking-wider ${p.enabled ? "bg-[oklch(0.85_0.21_155/0.12)] text-[var(--neon-green)]" : "bg-white/5 text-muted-foreground"}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${p.enabled ? "animate-pulse-dot" : ""}`} style={{ background: p.enabled ? "var(--neon-green)" : "var(--muted-foreground)", color: p.enabled ? "var(--neon-green)" : undefined }} />
                    {p.enabled ? "connected" : "disabled"}
                  </span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => test(p)} disabled={testing === p.id}
                            className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-white/5 hover:text-foreground disabled:opacity-50" title="Test connection">
                      <Activity className={`h-3.5 w-3.5 ${testing === p.id ? "animate-spin" : ""}`} />
                    </button>
                    <button onClick={() => openConfig(p)} className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-white/5 hover:text-foreground" title="Configure">
                      <SettingsIcon className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => setDisconnecting(p)} className="rounded-md px-2 py-1 text-[11px] text-[var(--neon-red)] hover:bg-[oklch(0.7_0.25_25/0.12)]">
                      Disconnect
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Modal open={connectOpen} onClose={() => setConnectOpen(false)} title="Connect a new provider"
             description="Provide an API key. We'll verify reachability before adding it to your routing pool."
             footer={<><Btn variant="secondary" onClick={() => setConnectOpen(false)}>Cancel</Btn><Btn onClick={submitConnect}>Connect</Btn></>}>
        <form onSubmit={(e) => { e.preventDefault(); submitConnect(); }} className="space-y-3">
          <Field label="Provider name">
            <input autoFocus value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required maxLength={48}
                   placeholder="e.g. Cohere"
                   className="h-9 w-full rounded-md border border-white/10 bg-white/[0.03] px-3 text-sm focus:border-[var(--neon-violet)]/40 focus:outline-none" />
          </Field>
          <Field label="API key">
            <input value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} required type="password"
                   placeholder="sk-…"
                   className="h-9 w-full rounded-md border border-white/10 bg-white/[0.03] px-3 font-mono text-sm focus:border-[var(--neon-violet)]/40 focus:outline-none" />
          </Field>
        </form>
      </Modal>

      <Modal open={!!configuring} onClose={() => setConfiguring(null)} title={`Configure · ${configuring?.name ?? ""}`}
             footer={<><Btn variant="secondary" onClick={() => setConfiguring(null)}>Cancel</Btn><Btn onClick={saveConfig}>Save</Btn></>}>
        <div className="space-y-3">
          <Field label="API key"><input value={cfg.key} onChange={(e) => setCfg({ ...cfg, key: e.target.value })} type="password" placeholder="leave blank to keep current"
                                       className="h-9 w-full rounded-md border border-white/10 bg-white/[0.03] px-3 font-mono text-sm focus:outline-none" /></Field>
          <Field label="Cost / 1k tokens"><input value={cfg.cost} onChange={(e) => setCfg({ ...cfg, cost: e.target.value })} placeholder="$0.010/1k"
                                                 className="h-9 w-full rounded-md border border-white/10 bg-white/[0.03] px-3 text-sm focus:outline-none" /></Field>
          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] p-3 text-sm">
            <span>Enabled in routing pool</span>
            <Toggle on={cfg.enabled} onChange={(v) => setCfg({ ...cfg, enabled: v })} />
          </div>
        </div>
      </Modal>

      <Modal open={!!disconnecting} onClose={() => setDisconnecting(null)} title="Disconnect provider"
             description={`This will remove ${disconnecting?.name} from your routing pool.`}
             footer={<><Btn variant="secondary" onClick={() => setDisconnecting(null)}>Cancel</Btn><Btn variant="danger" onClick={disconnect}>Disconnect</Btn></>}>
        <div className="flex gap-2 rounded-lg border border-[var(--neon-amber)]/30 bg-[oklch(0.83_0.17_80/0.08)] p-3 text-xs text-muted-foreground">
          <AlertTriangle className="h-4 w-4 shrink-0 text-[var(--neon-amber)]" />
          Active routing rules referencing this provider will fall back to their next configured target.
        </div>
      </Modal>
    </AppShell>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={() => onChange(!on)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${on ? "bg-[var(--neon-violet)]/60" : "bg-white/10"}`}>
      <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${on ? "translate-x-4" : "translate-x-0.5"}`} />
    </button>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] uppercase tracking-wider text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}
