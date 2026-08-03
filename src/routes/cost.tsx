import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHero, Panel, StatCard, Modal, Btn } from "@/components/app-shell";
import { DollarSign, TrendingDown, PiggyBank, Gauge, Pencil } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/cost")({
  head: () => ({
    meta: [
      { title: "Cost Intelligence — Orchestra AI" },
      { name: "description", content: "Forecast, attribute and optimize spend across every AI model and provider." },
    ],
  }),
  component: CostPage,
});

const byModel = [
  { name: "GPT-4o",     spend: 4210, color: "var(--neon-violet)" },
  { name: "Claude 3.5", spend: 2890, color: "var(--neon-cyan)" },
  { name: "Gemini 1.5", spend: 1620, color: "var(--neon-pink)" },
  { name: "DeepSeek",   spend: 410,  color: "var(--neon-green)" },
  { name: "Mistral",    spend: 320,  color: "var(--neon-amber)" },
  { name: "Ollama",     spend: 0,    color: "var(--neon-cyan)" },
];

type Budget = { project: string; used: number; cap: number };
const SEED: Budget[] = [
  { project: "Acme Production",  used: 8412, cap: 12000 },
  { project: "Atlas Copilot",    used: 3201, cap: 5000 },
  { project: "Compliance Vault", used: 1840, cap: 3000 },
  { project: "Helios Analytics", used: 1022, cap: 2500 },
  { project: "Voyager R&D",      used: 182,  cap: 1000 },
];

function CostPage() {
  const [budgets, setBudgets] = useState<Budget[]>(SEED);
  const [editing, setEditing] = useState<Budget | null>(null);
  const [draft, setDraft] = useState(0);

  useEffect(() => { try { const raw = window.localStorage.getItem("orchestra.budgets"); if (raw) setBudgets(JSON.parse(raw)); } catch { /* */ } }, []);
  useEffect(() => { window.localStorage.setItem("orchestra.budgets", JSON.stringify(budgets)); }, [budgets]);

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
        <StatCard label="MTD Spend"        value="$24,184" delta="-8.2%"  color="var(--neon-green)"  icon={DollarSign} />
        <StatCard label="Savings (routing)" value="$8,412" delta="+12.4%" color="var(--neon-cyan)"   icon={PiggyBank} />
        <StatCard label="Cache Savings"    value="$2,108"  delta="+4.1%"  color="var(--neon-violet)" icon={TrendingDown} />
        <StatCard label="Forecast EoM"     value="$31,420" delta="-5.6%"  color="var(--neon-pink)"   icon={Gauge} />
      </section>

      <Panel eyebrow="Distribution" title="Spend by Model (USD)">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={byModel}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="name" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
            <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
            <Tooltip contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8 }} />
            <Bar dataKey="spend" radius={[6, 6, 0, 0]}>
              {byModel.map((m) => <Cell key={m.name} fill={m.color} />)}
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
