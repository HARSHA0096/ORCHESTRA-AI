import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHero, Panel, StatCard, Btn } from "@/components/app-shell";
import { LineChart as LineIcon, TrendingUp, Users, Sparkles, Download } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Orchestra AI" },
      { name: "description", content: "Long-range analytics across requests, models, cost, quality and adoption." },
    ],
  }),
  component: AnalyticsPage,
});

const RANGES = { "7d": 7, "30d": 30, "90d": 90 } as const;
type RangeKey = keyof typeof RANGES;

function build(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    d: i + 1,
    requests: 12000 + Math.sin(i / 4) * 4000 + Math.random() * 2000 + i * 200,
    users:    420 + Math.sin(i / 5) * 80 + i * 6,
    quality:  88 + Math.sin(i / 3) * 4 + Math.random() * 2,
  }));
}

function AnalyticsPage() {
  const [range, setRange] = useState<RangeKey>("30d");
  const data = useMemo(() => build(RANGES[range]), [range]);
  const totalReqs = useMemo(() => Math.round(data.reduce((s, d) => s + d.requests, 0)), [data]);
  const avgQuality = useMemo(() => (data.reduce((s, d) => s + d.quality, 0) / data.length).toFixed(1), [data]);

  const exportCsv = () => {
    const csv = ["day,requests,users,quality", ...data.map((d) => `${d.d},${Math.round(d.requests)},${Math.round(d.users)},${d.quality.toFixed(2)}`)].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `analytics-${range}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

  return (
    <AppShell>
      <PageHero
        eyebrow={`Insights · ${range}`}
        title="Analytics"
        subtitle="Long-horizon trends across volume, adoption and quality. Slice by project, model or team to see what's actually driving outcomes."
        accent="var(--neon-pink)"
        actions={
          <>
            <div className="flex gap-1 rounded-md border border-white/10 bg-white/[0.03] p-0.5 text-[11px]">
              {(Object.keys(RANGES) as RangeKey[]).map((k) => (
                <button key={k} onClick={() => setRange(k)}
                        className={`rounded px-2 py-1 ${range === k ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground"}`}>{k}</button>
              ))}
            </div>
            <Btn variant="secondary" onClick={exportCsv}><Download className="h-4 w-4" /> Export</Btn>
          </>
        }
      />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label={`Requests (${range})`} value={fmt(totalReqs)} delta="+18%" color="var(--neon-cyan)"   icon={LineIcon} />
        <StatCard label="MAU"                   value="2,841" delta="+12%" color="var(--neon-violet)" icon={Users} />
        <StatCard label="Quality Score"         value={`${avgQuality}/100`} delta="+0.4" color="var(--neon-green)" icon={Sparkles} />
        <StatCard label="Growth"                value="+24%" delta="MoM"  color="var(--neon-pink)"   icon={TrendingUp} />
      </section>

      <Panel eyebrow="Volume" title="Daily Requests">
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="aReq" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--neon-violet)" stopOpacity={0.5} />
                <stop offset="100%" stopColor="var(--neon-violet)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="d" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
            <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
            <Tooltip contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8 }} />
            <Area type="monotone" dataKey="requests" stroke="var(--neon-violet)" fill="url(#aReq)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </Panel>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel eyebrow="Adoption" title="Active Users">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data}>
              <defs><linearGradient id="aUsr" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="var(--neon-cyan)" stopOpacity={0.5} /><stop offset="100%" stopColor="var(--neon-cyan)" stopOpacity={0} /></linearGradient></defs>
              <XAxis dataKey="d" hide /><YAxis hide />
              <Tooltip contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8 }} />
              <Area type="monotone" dataKey="users" stroke="var(--neon-cyan)" fill="url(#aUsr)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>
        <Panel eyebrow="Outcomes" title="Quality Score (1–100)">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data}>
              <defs><linearGradient id="aQ" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="var(--neon-green)" stopOpacity={0.5} /><stop offset="100%" stopColor="var(--neon-green)" stopOpacity={0} /></linearGradient></defs>
              <XAxis dataKey="d" hide /><YAxis domain={[80, 100]} hide />
              <Tooltip contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8 }} />
              <Area type="monotone" dataKey="quality" stroke="var(--neon-green)" fill="url(#aQ)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>
      </section>
    </AppShell>
  );
}

function fmt(n: number) { if (n >= 1e6) return (n / 1e6).toFixed(2) + "M"; if (n >= 1e3) return (n / 1e3).toFixed(0) + "k"; return String(n); }
