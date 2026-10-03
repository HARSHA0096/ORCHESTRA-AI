import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHero, Panel, StatCard, Modal, Btn } from "@/components/app-shell";
import { DollarSign, TrendingDown, PiggyBank, Gauge, Pencil } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api, session } from "@/lib/api";

export const Route = createFileRoute("/cost")({
  head: () => ({
    meta: [
      { title: "Cost Intelligence — Orchestra AI" },
      { name: "description", content: "Forecast, attribute and optimize spend across every AI model and provider." },
    ],
  }),
  component: CostPage,
});

const byModel: { name: string; spend: number; color: string }[] = [];

type Budget = { project: string; used: number; cap: number };
const SEED: Budget[] = [];

function CostPage() {
  const [budgets, setBudgets] = useState<Budget[]>(SEED);
  const [spend, setSpend] = useState(0);
  const [modelSpend, setModelSpend] = useState<{ name: string; spend: number; color: string }[]>([]);
  const [editing, setEditing] = useState<Budget | null>(null);
  const [draft, setDraft] = useState(0);

  useEffect(() => { if (!session.accessToken || !session.projectId) return; Promise.all([api.get<any>(`/api/v1/projects/${session.projectId}/budget`), api.get<any>(`/api/v1/history?projectId=${encodeURIComponent(session.projectId)}&perPage=100`)]).then(([budget, history]) => { const used = (history ?? []).reduce((sum: number, e: any) => sum + Number(e.cost ?? 0), 0); setSpend(used); const grouped = new Map<string, number>(); (history ?? []).forEach((e: any) => grouped.set(e.modelId ?? "unknown", (grouped.get(e.modelId ?? "unknown") ?? 0) + Number(e.cost ?? 0))); setModelSpend(Array.from(grouped, ([name, value]) => ({ name, spend: value, color: "var(--neon-cyan)" }))); setBudgets(budget ? [{ project: "Current project", used, cap: Number(budget.limitAmount ?? 0) }] : []); }).catch(() => undefined); }, []);

  const openEdit = (b: Budget) => { setDraft(b.cap); setEditing(b); };
  const save = () => {
    if (!editing) return;
    if (draft < 0 || isNaN(draft)) { toast.error("Cap must be a positive number"); return; }
    setBudgets((s) => s.map((b) => b.project === editing.project ? { ...b, cap: draft } : b));
    toast.success(`${editing.project} budget updated`);
    setEditing(null);
  };

  return (
    <AppShell>
      <PageHero
        eyebrow="Finance · Realtime"
        title="Cost Intelligence"
        subtitle="See exactly where every dollar goes. Forecast spend, enforce budgets per project and unlock savings through smart routing and caching."
        accent="var(--neon-green)"
      />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="MTD Spend"        value={`$${spend.toFixed(4)}`} delta={spend ? "Live" : "No data"}  color="var(--neon-green)"  icon={DollarSign} />
        <StatCard label="Savings (routing)" value="$0" delta="No data" color="var(--neon-cyan)"   icon={PiggyBank} />
        <StatCard label="Cache Savings"    value="$0"  delta="No data"  color="var(--neon-violet)" icon={TrendingDown} />
        <StatCard label="Forecast EoM"     value="—" delta="No data"  color="var(--neon-pink)"   icon={Gauge} />
      </section>

      <Panel eyebrow="Distribution" title="Spend by Model (USD)">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={modelSpend}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="name" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
            <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
            <Tooltip contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8 }} />
            <Bar dataKey="spend" radius={[6, 6, 0, 0]}>
              {modelSpend.map((m) => <Cell key={m.name} fill={m.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Panel>

      <Panel eyebrow="Budgets" title="Per-Project Spend">
        <div className="space-y-3">
          {budgets.map((b) => {
            const pct = Math.min(100, (b.used / Math.max(1, b.cap)) * 100);
            const warn = pct > 70;
            return (
              <div key={b.project} className="group">
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium">{b.project}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-muted-foreground">${b.used.toLocaleString()} / ${b.cap.toLocaleString()}</span>
                    <button onClick={() => openEdit(b)} aria-label="Edit budget"
                            className="grid h-6 w-6 place-items-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:bg-white/5 hover:text-foreground group-hover:opacity-100">
                      <Pencil className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/5">
                  <div className="h-full rounded-full transition-all" style={{
                    width: `${pct}%`,
                    background: warn ? "linear-gradient(90deg, var(--neon-amber), var(--neon-pink))" : "var(--gradient-green-cyan)",
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={`Edit budget · ${editing?.project ?? ""}`}
             footer={<><Btn variant="secondary" onClick={() => setEditing(null)}>Cancel</Btn><Btn onClick={save}>Save</Btn></>}>
        <label className="mb-1 block text-[11px] uppercase tracking-wider text-muted-foreground">Monthly cap (USD)</label>
        <input autoFocus type="number" min={0} value={draft} onChange={(e) => setDraft(Number(e.target.value))}
               className="h-9 w-full rounded-md border border-white/10 bg-white/[0.03] px-3 font-mono text-sm focus:outline-none" />
      </Modal>
    </AppShell>
  );
}
