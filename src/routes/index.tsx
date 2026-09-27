import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Activity, AlertTriangle, Bell, Boxes, Brain, ChevronRight, Command, Cpu,
  Gauge, Globe2, KeyRound, LayoutDashboard, LifeBuoy, LineChart as LineIcon,
  Maximize2, Moon, Network, Pause, Play, Plug, Radar, Rocket, Router as RouterIcon,
  Search, Settings, Shield, ShieldAlert, Sparkles, Sun, TerminalSquare, Wifi,
  Workflow, Zap, ChevronLeft, History, BellRing, ScrollText, User,
} from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, Cell, Line, LineChart,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { motion } from "framer-motion";
import { EASE, StaggerGroup, StaggerItem } from "@/lib/motion";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mission Control — Orchestra AI" },
      { name: "description", content: "Monitor every AI request, model, threat and recovery in real time from the Orchestra AI mission control dashboard." },
      { property: "og:title", content: "Orchestra AI — Mission Control Dashboard" },
      { property: "og:description", content: "Enterprise AI operations center: gateway, security, cost, routing, self-healing and observability." },
    ],
  }),
  component: Dashboard,
});

/* ---------------- Data-driven dashboard ---------------- */

const SIDEBAR_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", shortcut: "⌘1", active: true },
  { icon: Boxes,           label: "Projects",     shortcut: "⌘2" },
  { icon: Network,         label: "Gateway",      shortcut: "⌘3" },
  { icon: Shield,          label: "Security",     shortcut: "⌘4",  },
  { icon: Gauge,           label: "Cost Intelligence", shortcut: "⌘5" },
  { icon: RouterIcon,      label: "Model Router", shortcut: "⌘6" },
  { icon: LifeBuoy,        label: "Self-Healing", shortcut: "⌘7" },
  { icon: Radar,           label: "Observability", shortcut: "⌘8" },
  { icon: Plug,            label: "Providers",    shortcut: "⌘9" },
  { icon: KeyRound,        label: "API Keys" },
  { icon: History,         label: "History" },
  { icon: LineIcon,        label: "Analytics" },
  { icon: BellRing,        label: "Notifications",  },
  { icon: Settings,        label: "Settings" },
  { icon: User,            label: "Profile" },
];

const trendData: { t: number; requests: number; cost: number }[] = [];

const modelUsage: { name: string; value: number; fill: string }[] = [];

const PROVIDERS: { name: string; latency: number; uptime: number; health: number; requests: number; avgCost: number; color: string }[] = [];

const SYSTEM_HEALTH: { name: string; status: string; value: number }[] = [];

const SECURITY_THREATS: { label: string; value: number; color: string }[] = [];

const REQUEST_SEED: { time: string; project: string; model: string; status: string; cost: number; latency: number; tokens: number; stage: string }[] = [];

const KPIS = [
  { label: "Total Requests",   value: 0, delta: "No data", suffix: "", icon: Activity, color: "var(--neon-violet)" },
  { label: "Successful",       value: 0, delta: "No data", suffix: "", icon: Sparkles, color: "var(--neon-green)" },
  { label: "Failed",           value: 0, delta: "No data", suffix: "", icon: AlertTriangle, color: "var(--neon-red)" },
  { label: "Recovered",        value: 0, delta: "No data", suffix: "", icon: LifeBuoy, color: "var(--neon-cyan)" },
  { label: "Today's Cost",     value: 0, delta: "No data", prefix: "$", icon: Gauge, color: "var(--neon-amber)" },
  { label: "Money Saved",      value: 0, delta: "No data", prefix: "$", icon: Sparkles, color: "var(--neon-green)" },
  { label: "Blocked Requests", value: 0, delta: "No data", suffix: "", icon: ShieldAlert, color: "var(--neon-pink)" },
  { label: "Avg Latency",      value: 0, delta: "No data", suffix: "ms", icon: Zap, color: "var(--neon-cyan)" },
  { label: "Avg Tokens",       value: 0, delta: "No data", suffix: "", icon: Brain, color: "var(--neon-violet)" },
  { label: "Active Models",    value: 0, delta: "No data", suffix: "", icon: Cpu, color: "var(--neon-pink)" },
  { label: "Recovery Rate",    value: 0, delta: "No data", suffix: "%", icon: LifeBuoy, color: "var(--neon-green)" },
  { label: "Gateway Health",   value: 0, delta: "No data", suffix: "%", icon: Network, color: "var(--neon-violet)" },
];

type DashboardMetrics = {
  totalRequests: number; successful: number; failed: number; recovered: number; totalCost: number;
  avgLatencyMs: number; avgTokens: number; blockedRequests: number; activeModels: number; recoveryRate: number; gatewayHealth: number;
};

const WORKFLOW_NODES = [
  { id: "app",    label: "Application",  sub: "Client SDK",   icon: TerminalSquare, color: "var(--neon-cyan)" },
  { id: "gw",     label: "Gateway",      sub: "Edge Router",  icon: Network,        color: "var(--neon-violet)" },
  { id: "sec",    label: "Security",     sub: "Threat Filter",icon: Shield,         color: "var(--neon-pink)" },
  { id: "cost",   label: "Cost Intel",   sub: "Budget Guard", icon: Gauge,          color: "var(--neon-amber)" },
  { id: "router", label: "Model Router", sub: "Smart Select", icon: RouterIcon,     color: "var(--neon-violet)" },
  { id: "model",  label: "AI Model",     sub: "GPT-4o",       icon: Brain,          color: "var(--neon-green)" },
  { id: "heal",   label: "Self-Healing", sub: "Retry / Fallback", icon: LifeBuoy,   color: "var(--neon-cyan)" },
  { id: "resp",   label: "Response",     sub: "Streamed",     icon: Sparkles,       color: "var(--neon-pink)" },
];

const TIMELINE: { t: string; kind: string; text: string; tag: string }[] = [];

/* ---------------- Helpers ---------------- */

function useAnimatedCounter(target: number, duration = 1100) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const from = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(from + (target - from) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return v;
}

function fmt(n: number, prefix = "", suffix = "") {
  const v = n >= 1000 ? n.toLocaleString(undefined, { maximumFractionDigits: 0 })
        : n % 1 !== 0 ? n.toLocaleString(undefined, { maximumFractionDigits: 2 })
        : n.toString();
  return `${prefix}${v}${suffix}`;
}

function statusTone(s: string) {
  switch (s) {
    case "completed": return { bg: "bg-[oklch(0.85_0.21_155/0.12)]", text: "text-[var(--neon-green)]", dot: "var(--neon-green)" };
    case "blocked":   return { bg: "bg-[oklch(0.7_0.25_25/0.14)]",  text: "text-[var(--neon-red)]",   dot: "var(--neon-red)"   };
    case "recovered": return { bg: "bg-[oklch(0.84_0.16_210/0.14)]", text: "text-[var(--neon-cyan)]",  dot: "var(--neon-cyan)"  };
    case "routing":   return { bg: "bg-[oklch(0.7_0.24_295/0.14)]",  text: "text-[var(--neon-violet)]",dot: "var(--neon-violet)"};
    default:          return { bg: "bg-white/5", text: "text-muted-foreground", dot: "var(--muted-foreground)" };
  }
}

/* ---------------- Sub-components ---------------- */

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const w = 120, h = 36;
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((d - min) / Math.max(1, max - min)) * h;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const area = `0,${h} ${pts} ${w},${h}`;
  const id = useMemo(() => `spark-${color.replace(/[^a-z0-9]/gi, '') || 'default'}`, [color]);
  return (
    <svg width={w} height={h} className="overflow-visible">
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.45" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${id})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.6"
        style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
    </svg>
  );
}

function KpiCard({ k, idx }: { k: typeof KPIS[number]; idx: number }) {
  const val = useAnimatedCounter(k.value, 900 + idx * 30);
  const spark = useMemo(() => {
    const base = Number(k.value) || 0;
    return Array.from({ length: 22 }, (_, i) => base === 0 ? 0 : Math.max(0, base * (0.85 + ((i % 7) / 100))));
  }, [k.value]);
  const Icon = k.icon;
  const positive = k.delta.trim().startsWith("+");
  return (
    <div
      className="glass-card group relative p-4 transition-transform duration-300 hover:-translate-y-0.5 animate-rise-in"
      style={{ animationDelay: `${idx * 40}ms` }}
    >
      <div className="absolute inset-x-0 -top-px h-px"
           style={{ background: `linear-gradient(90deg, transparent, ${k.color}, transparent)` }} />
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{k.label}</div>
          <div className="mt-1 font-display text-2xl font-semibold tabular-nums text-foreground">
            {fmt(val, k.prefix ?? "", k.suffix ?? "")}
          </div>
        </div>
        <div
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"
          style={{ background: `${k.color}1f`, color: k.color, boxShadow: `0 0 18px -6px ${k.color}` }}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-3 flex items-end justify-between">
        <span
          className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium ${
            positive ? "text-[var(--neon-green)] bg-[oklch(0.85_0.21_155/0.12)]" : "text-[var(--neon-red)] bg-[oklch(0.7_0.25_25/0.12)]"
          }`}
        >
          {k.delta} <span className="text-muted-foreground/80 font-normal">vs yesterday</span>
        </span>
        <Sparkline data={spark} color={k.color} />
      </div>
    </div>
  );
}

function Sidebar({ collapsed, setCollapsed }: { collapsed: boolean; setCollapsed: (v: boolean) => void }) {
  return (
    <aside
      className="glass-panel sticky top-4 hidden h-[calc(100vh-2rem)] flex-col p-3 transition-[width] duration-300 ease-out md:flex"
      style={{ width: collapsed ? 78 : 264 }}
    >
      <div className="mb-4 flex items-center gap-3 px-2">
        <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl"
             style={{ background: "var(--gradient-violet-cyan)", boxShadow: "var(--shadow-glow-violet)" }}>
          <Workflow className="h-5 w-5 text-[oklch(0.16_0.04_270)]" />
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[var(--neon-green)] ring-2 ring-[var(--background)] animate-pulse-dot" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="font-display text-sm font-semibold tracking-wide">ORCHESTRA AI</div>
            <div className="truncate text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Mission Control</div>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto pr-1">
        {SIDEBAR_ITEMS.map((it, i) => {
          const Icon = it.icon;
          return (
            <button
              key={it.label}
              className={`group relative flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors ${
                it.active
                  ? "bg-white/[0.06] text-foreground"
                  : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
              }`}
            >
              {it.active && (
                <span className="absolute left-0 top-1.5 h-[calc(100%-12px)] w-[3px] rounded-r-full"
                      style={{ background: "var(--gradient-violet-cyan)", boxShadow: "0 0 12px var(--neon-violet)" }} />
              )}
              <Icon className={`h-4 w-4 shrink-0 transition-colors ${
                it.active ? "text-[var(--neon-cyan)]" : "group-hover:text-[var(--neon-cyan)]"
              }`} />
              {!collapsed && (
                <>
                  <span className="flex-1 truncate text-left">{it.label}</span>
                  {it.badge && (
                    <span className="rounded-md bg-[oklch(0.7_0.24_295/0.2)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--neon-violet)]">
                      {it.badge}
                    </span>
                  )}
                  {it.shortcut && !it.badge && (
                    <span className="font-mono text-[10px] text-muted-foreground/60">{it.shortcut}</span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-3 border-t border-white/5 pt-3">
        {!collapsed ? (
          <div className="flex items-center gap-3 rounded-lg bg-white/[0.03] p-2">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-[var(--gradient-pink-violet)] font-display text-sm font-semibold text-[oklch(0.16_0.04_270)]">--</div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">No user session</div>
              <div className="truncate text-[11px] text-muted-foreground">Connect authentication</div>
            </div>
            <button
              aria-label="Collapse sidebar"
              onClick={() => setCollapsed(true)}
              className="rounded-md p-1 text-muted-foreground hover:bg-white/5 hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            aria-label="Expand sidebar"
            onClick={() => setCollapsed(false)}
            className="grid h-9 w-full place-items-center rounded-lg bg-white/[0.04] text-muted-foreground hover:text-foreground"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </aside>
  );
}

function TopBar() {
  return (
    <div className="glass-panel flex items-center gap-3 px-3 py-2.5">
      <button className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/5 text-[var(--neon-cyan)] hover:bg-white/10" aria-label="Open command palette">
        <Command className="h-4 w-4" />
      </button>
      <div className="relative flex min-w-0 flex-1 items-center">
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
        <input
          placeholder="Search requests, models, projects, threats…"
          className="h-9 w-full rounded-lg border border-white/5 bg-white/[0.03] pl-9 pr-20 text-sm placeholder:text-muted-foreground/60 focus:border-[var(--neon-violet)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--neon-violet)]/20"
        />
        <span className="absolute right-2 hidden items-center gap-1 rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:flex">
          ⌘ K
        </span>
      </div>
      <div className="hidden items-center gap-2 lg:flex">
        <button className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground">
          <Globe2 className="h-3.5 w-3.5 text-[var(--neon-cyan)]" /> ORCHESTRA / Demo
          <ChevronRight className="h-3 w-3 rotate-90" />
        </button>
        <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-xs">
          <Wifi className="h-3.5 w-3.5 text-[var(--neon-green)] animate-glow-pulse" />
          <span className="text-muted-foreground">Connected</span>
          <span className="font-mono text-[var(--neon-green)]">—</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-xs">
          <span className="relative inline-flex h-2 w-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-[var(--neon-green)] opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--neon-green)]" />
          </span>
          <span className="text-muted-foreground">System</span>
          <span className="text-[var(--neon-green)]">—</span>
        </div>
      </div>
      <button className="relative grid h-9 w-9 place-items-center rounded-lg bg-white/5 hover:bg-white/10" aria-label="Notifications">
        <Bell className="h-4 w-4" />
        <span className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-full bg-[var(--neon-pink)] text-[9px] font-semibold text-[oklch(0.16_0.04_270)]">12</span>
      </button>
      <button className="grid h-9 w-9 place-items-center rounded-lg bg-white/5 hover:bg-white/10" aria-label="Toggle theme">
        <Moon className="h-4 w-4 text-[var(--neon-cyan)]" />
        <Sun className="hidden h-4 w-4" />
      </button>
    </div>
  );
}

function Hero() {
  return (
    <motion.section
      className="glass-card relative overflow-hidden p-6 md:p-8"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: EASE }}
    >
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="absolute -left-20 top-0 h-72 w-72 rounded-full blur-3xl animate-float-orb"
           style={{ background: "oklch(0.7 0.24 295 / 0.35)" }} />
      <div className="absolute -right-10 -bottom-16 h-80 w-80 rounded-full blur-3xl animate-float-orb"
           style={{ background: "oklch(0.84 0.16 210 / 0.3)", animationDelay: "2s" }} />
      <div className="absolute right-1/3 top-1/2 h-40 w-40 rounded-full blur-2xl animate-float-orb"
           style={{ background: "oklch(0.74 0.24 340 / 0.3)", animationDelay: "4s" }} />

      <div className="relative grid grid-cols-[minmax(0,1fr)_auto] items-start gap-6 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-[var(--neon-cyan)]">
            <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-[var(--neon-cyan)] text-[var(--neon-cyan)]" />
            Mission Status — All Systems Operational
          </div>
          <h1 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
            <span className="text-gradient">ORCHESTRA AI</span>
            <span className="ml-3 text-foreground/70 text-base font-normal md:text-lg">/ ORCHESTRA · Demo</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
            Welcome back, Jane. Your AI ecosystem processed <span className="font-mono text-foreground">24,786</span> requests today,
            blocked <span className="font-mono text-[var(--neon-pink)]">134</span> threats, and saved
            <span className="font-mono text-[var(--neon-green)]"> $1,283.19</span> through smart routing.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button className="hidden items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-muted-foreground hover:text-foreground md:flex">
            <Pause className="h-3.5 w-3.5" /> Pause Stream
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium text-[oklch(0.16_0.04_270)]"
            style={{ background: "var(--gradient-violet-cyan)", boxShadow: "var(--shadow-glow-violet)" }}
          >
            <Rocket className="h-4 w-4" /> New Project
          </button>
        </div>
      </div>

      {/* Mission badges */}
      <StaggerGroup className="relative mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "AI Health",       value: "—", color: "var(--neon-green)" },
          { label: "Active Models",   value: "0", color: "var(--neon-violet)" },
          { label: "Live Requests",   value: "0", color: "var(--neon-cyan)" },
          { label: "Threat Level",    value: "—", color: "var(--neon-amber)" },
        ].map((b) => (
          <StaggerItem key={b.label} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 backdrop-blur">
            <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{b.label}</div>
            <div className="mt-0.5 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full animate-pulse-dot" style={{ background: b.color, color: b.color }} />
              <span className="font-display text-lg font-semibold" style={{ color: b.color }}>{b.value}</span>
            </div>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </motion.section>
  );
}

function TrendChart() {
  return (
    <div className="glass-card p-4 md:p-5">
      <div className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between">
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Operations</div>
          <h3 className="font-display text-base font-semibold">Request &amp; Cost Trend</h3>
        </div>
        <div className="flex shrink-0 items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] p-0.5 text-xs">
          {["1H", "Today", "7D", "30D"].map((p, i) => (
            <button key={p}
              className={`rounded-md px-2.5 py-1 ${i === 1 ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {p}
            </button>
          ))}
        </div>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="gReq" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--neon-violet)" stopOpacity={0.5} />
                <stop offset="100%" stopColor="var(--neon-violet)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gCost" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--neon-cyan)" stopOpacity={0.45} />
                <stop offset="100%" stopColor="var(--neon-cyan)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="oklch(1 0 0 / 0.05)" vertical={false} />
            <XAxis dataKey="t" tickFormatter={(v) => `${String(Math.floor(v / 2)).padStart(2, "0")}:00`}
                   stroke="oklch(1 0 0 / 0.3)" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="oklch(1 0 0 / 0.3)" fontSize={10} tickLine={false} axisLine={false} width={32} />
            <Tooltip
              contentStyle={{ background: "var(--surface-2)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 10, fontSize: 12 }}
              labelStyle={{ color: "var(--muted-foreground)" }}
            />
            <Area type="monotone" dataKey="requests" stroke="var(--neon-violet)" strokeWidth={2} fill="url(#gReq)" />
            <Area type="monotone" dataKey="cost"     stroke="var(--neon-cyan)"   strokeWidth={2} fill="url(#gCost)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[var(--neon-violet)]" /> Requests</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[var(--neon-cyan)]" /> Cost ($)</span>
      </div>
    </div>
  );
}

function ModelUsage() {
  const total = modelUsage.reduce((a, b) => a + b.value, 0);
  return (
    <div className="glass-card p-4 md:p-5">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Distribution</div>
          <h3 className="font-display text-base font-semibold">Model Usage</h3>
        </div>
        <button className="grid h-7 w-7 place-items-center rounded-md bg-white/5 text-muted-foreground hover:text-foreground" aria-label="Expand">
          <Maximize2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-[180px_minmax(0,1fr)]">
        <div className="relative h-44">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={modelUsage} dataKey="value" innerRadius={52} outerRadius={72} paddingAngle={3} stroke="none">
                {modelUsage.map((m, i) => <Cell key={i} fill={m.fill} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="text-center">
              <div className="font-display text-xl font-semibold tabular-nums">{total.toLocaleString()}%</div>
              <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Total Mix</div>
            </div>
          </div>
        </div>
        <ul className="space-y-2 text-sm">
          {modelUsage.map((m) => (
            <li key={m.name} className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: m.fill, boxShadow: `0 0 10px ${m.fill}` }} />
              <span className="flex-1 truncate text-foreground/90">{m.name}</span>
              <span className="font-mono tabular-nums text-muted-foreground">{m.value}%</span>
              <span className="w-16 text-right font-mono tabular-nums text-foreground/70">{(m.value * 280).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* Workflow graph — custom animated SVG (no react-flow dep) */
function WorkflowGraph() {
  // node coordinates (responsive via viewBox)
  const positions: Record<string, { x: number; y: number }> = {
    app:    { x: 60,  y: 130 },
    gw:     { x: 200, y: 130 },
    sec:    { x: 340, y: 60  },
    cost:   { x: 340, y: 200 },
    router: { x: 500, y: 130 },
    model:  { x: 660, y: 70  },
    heal:   { x: 660, y: 190 },
    resp:   { x: 820, y: 130 },
  };
  const edges: [string, string][] = [
    ["app","gw"], ["gw","sec"], ["gw","cost"], ["sec","router"], ["cost","router"],
    ["router","model"], ["router","heal"], ["model","resp"], ["heal","resp"],
  ];

  return (
    <div className="glass-card relative overflow-hidden p-4 md:p-5">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="relative mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-[var(--neon-cyan)]">
            <Workflow className="h-3.5 w-3.5" /> Flagship
          </div>
          <h3 className="mt-0.5 font-display text-lg font-semibold">AI Workflow Monitor</h3>
          <p className="text-xs text-muted-foreground">Live execution graph for every request flowing through the Orchestra pipeline.</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <button className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-muted-foreground hover:text-foreground">
            <Play className="h-3 w-3" /> Replay
          </button>
          <button className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-muted-foreground hover:text-foreground">
            <Maximize2 className="h-3 w-3" /> Inspect
          </button>
        </div>
      </div>

      <div className="relative">
        <svg viewBox="0 0 900 280" className="h-[300px] w-full">
          <defs>
            <linearGradient id="edgeGrad" x1="0" x2="1">
              <stop offset="0%" stopColor="var(--neon-violet)" stopOpacity="0.9" />
              <stop offset="100%" stopColor="var(--neon-cyan)" stopOpacity="0.9" />
            </linearGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {edges.map(([a, b], i) => {
            const p1 = positions[a], p2 = positions[b];
            return (
              <g key={`${a}-${b}`}>
                <path d={`M${p1.x + 50},${p1.y} C${(p1.x + p2.x) / 2},${p1.y} ${(p1.x + p2.x) / 2},${p2.y} ${p2.x - 50},${p2.y}`}
                      fill="none" stroke="oklch(1 0 0 / 0.08)" strokeWidth="2" />
                <path d={`M${p1.x + 50},${p1.y} C${(p1.x + p2.x) / 2},${p1.y} ${(p1.x + p2.x) / 2},${p2.y} ${p2.x - 50},${p2.y}`}
                      fill="none" stroke="url(#edgeGrad)" strokeWidth="2" strokeDasharray="6 8"
                      className="animate-dash-flow" filter="url(#glow)"
                      style={{ animationDelay: `${i * 0.15}s` }} />
              </g>
            );
          })}

          {WORKFLOW_NODES.map((n) => {
            const p = positions[n.id];
            const Icon = n.icon;
            return (
              <g key={n.id} transform={`translate(${p.x - 50}, ${p.y - 32})`}>
                <rect width="100" height="64" rx="14"
                      fill="oklch(0.21 0.05 270 / 0.95)" stroke={n.color} strokeOpacity="0.5" />
                <rect width="100" height="64" rx="14" fill="none" stroke={n.color} strokeOpacity="0.25"
                      strokeWidth="6" filter="url(#glow)" />
                <circle cx="86" cy="12" r="3.5" fill={n.color} className="animate-pulse-dot" style={{ color: n.color }} />
                <foreignObject x="10" y="10" width="80" height="46">
                  <div className="flex h-full flex-col justify-center">
                    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.1em]" style={{ color: n.color }}>
                      <Icon className="h-3 w-3" />
                      {n.label}
                    </div>
                    <div className="truncate text-[11px] text-foreground/80">{n.sub}</div>
                  </div>
                </foreignObject>
              </g>
            );
          })}

        </svg>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[var(--neon-violet)] animate-pulse-dot text-[var(--neon-violet)]" /> Active path</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[var(--neon-cyan)]" /> Streaming</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[var(--neon-pink)]" /> Recovery</span>
          </div>
          <div className="flex items-center gap-2 font-mono">
            <span>req_84a2c1</span><span className="text-muted-foreground/60">·</span>
            <span className="text-[var(--neon-green)]">412ms</span>
            <span className="text-muted-foreground/60">·</span>
            <span>GPT-4o</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function LiveRequests() {
  const [requests, setRequests] = useState(REQUEST_SEED);
  useEffect(() => {
    if (requests.length === 0) return;
    const id = setInterval(() => {
      setRequests((prev) => prev.length ? prev.map((item, index) => index === 0 ? { ...item, time: new Date().toLocaleTimeString() } : item) : prev);
    }, 5000);
    return () => clearInterval(id);
  }, [requests.length]);

  return (
    <div className="glass-card flex h-full flex-col p-4 md:p-5">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-[var(--neon-pink)]">
            <span className="relative inline-flex h-2 w-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-[var(--neon-pink)] opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--neon-pink)]" />
            </span>
            Live Feed
          </div>
          <h3 className="font-display text-base font-semibold">Live AI Requests</h3>
        </div>
        <select className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-xs text-muted-foreground focus:outline-none">
          <option>All Projects</option>
        </select>
      </div>
      <ul className="flex-1 space-y-2 overflow-y-auto pr-1">
        {requests.map((r, i) => {
          const t = statusTone(r.status);
          return (
            <li key={`${r.time}-${i}`}
                className="group relative grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-2.5 transition-colors hover:border-white/10 hover:bg-white/[0.04] animate-rise-in">
              <div className="grid h-9 w-9 place-items-center rounded-lg" style={{ background: `${t.dot}1f`, color: t.dot as string }}>
                <Brain className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate font-mono text-[11px] text-muted-foreground">{r.time}</span>
                  <span className="truncate text-sm font-medium">{r.model}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="truncate">{r.project}</span>
                  <span>·</span>
                  <span className="font-mono">{r.tokens || "—"} tk</span>
                  <span>·</span>
                  <span className="font-mono">${r.cost.toFixed(3)}</span>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className={`inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-[10px] uppercase tracking-wide ${t.bg} ${t.text}`}>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: t.dot as string }} />
                  {r.status}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">{r.stage}</span>
              </div>
              <span className="pointer-events-none absolute inset-x-2 -bottom-px h-px overflow-hidden">
                <span className="absolute inset-y-0 left-0 w-1/3 animate-shimmer"
                      style={{ background: `linear-gradient(90deg, transparent, ${t.dot}, transparent)` }} />
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SystemHealth() {
  const dot = (s: string) =>
    s === "healthy" ? "var(--neon-green)" : s === "warn" ? "var(--neon-amber)" : "var(--neon-red)";
  return (
    <div className="glass-card p-4 md:p-5">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Infrastructure</div>
          <h3 className="font-display text-base font-semibold">System Health</h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative h-16 w-16">
            <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90">
              <circle cx="32" cy="32" r="26" stroke="oklch(1 0 0 / 0.08)" strokeWidth="6" fill="none" />
              <circle cx="32" cy="32" r="26" stroke="var(--neon-green)" strokeWidth="6" fill="none"
                      strokeLinecap="round" strokeDasharray="0 163.36"
                      style={{ filter: "drop-shadow(0 0 6px var(--neon-green))" }} />
            </svg>
            <div className="absolute inset-0 grid place-items-center font-display text-sm font-semibold text-[var(--neon-green)]">—</div>
          </div>
        </div>
      </div>
      <ul className="grid grid-cols-1 gap-1.5 text-sm sm:grid-cols-2">
        {SYSTEM_HEALTH.map((c) => (
          <li key={c.name} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-2.5 py-1.5">
            <span className="flex items-center gap-2 text-foreground/85">
              <span className="h-2 w-2 rounded-full animate-pulse-dot" style={{ background: dot(c.status), color: dot(c.status) }} />
              <span className="truncate">{c.name}</span>
            </span>
            <span className="font-mono text-xs" style={{ color: dot(c.status) }}>
              {c.status === "healthy" ? "Healthy" : c.status === "warn" ? "Warn" : "Degraded"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CostIntelligence() {
  const data = trendData.map((d) => ({
    t: d.t,
    spend: d.cost,
    saved: d.cost * (0.4 + Math.sin(d.t / 3) * 0.15),
    projected: d.cost * 1.25,
  }));
  return (
    <div className="glass-card p-4 md:p-5">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-[var(--neon-amber)]">
            <Gauge className="h-3.5 w-3.5" /> Cost Intelligence
          </div>
          <h3 className="font-display text-base font-semibold">Spend vs Savings vs Projection</h3>
        </div>
        <div className="hidden gap-3 text-xs md:flex">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[var(--neon-amber)]" /> Spend</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[var(--neon-green)]" /> Saved</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[var(--neon-violet)]" /> Projected</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { l: "Daily Spend", v: "$482.43", c: "var(--neon-amber)" },
          { l: "Monthly",     v: "$11,420", c: "var(--neon-violet)" },
          { l: "Saved",       v: "$1,283",  c: "var(--neon-green)" },
          { l: "Budget Used", v: "62%",     c: "var(--neon-cyan)" },
        ].map((s) => (
          <div key={s.l} className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
            <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{s.l}</div>
            <div className="font-display text-lg font-semibold" style={{ color: s.c }}>{s.v}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 h-44">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
            <CartesianGrid stroke="oklch(1 0 0 / 0.05)" vertical={false} />
            <XAxis dataKey="t" hide />
            <YAxis stroke="oklch(1 0 0 / 0.3)" fontSize={10} tickLine={false} axisLine={false} width={28} />
            <Tooltip contentStyle={{ background: "var(--surface-2)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 10, fontSize: 12 }} />
            <Line type="monotone" dataKey="spend"     stroke="var(--neon-amber)"  strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="saved"     stroke="var(--neon-green)"  strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="projected" stroke="var(--neon-violet)" strokeWidth={2} strokeDasharray="4 4" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function SecurityCenter() {
  const max = Math.max(...SECURITY_THREATS.map((t) => t.value));
  return (
    <div className="glass-card relative overflow-hidden p-4 md:p-5">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full blur-3xl"
           style={{ background: "oklch(0.74 0.24 340 / 0.25)" }} />
      <div className="relative mb-3 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-[var(--neon-pink)]">
            <ShieldAlert className="h-3.5 w-3.5" /> Security Center
          </div>
          <h3 className="font-display text-base font-semibold">Live Threat Monitor</h3>
        </div>
        <div className="rounded-md border border-[var(--neon-amber)]/40 bg-[oklch(0.83_0.17_80/0.12)] px-2 py-0.5 text-[10px] uppercase tracking-wide text-[var(--neon-amber)]">
          Threat Level: Low
        </div>
      </div>
      <div className="relative grid grid-cols-[120px_minmax(0,1fr)] items-center gap-4">
        <div className="relative grid place-items-center">
          <svg viewBox="0 0 120 120" className="h-28 w-28 -rotate-90">
            <circle cx="60" cy="60" r="48" stroke="oklch(1 0 0 / 0.08)" strokeWidth="8" fill="none" />
            <circle cx="60" cy="60" r="48" stroke="var(--neon-pink)" strokeWidth="8" fill="none"
                    strokeLinecap="round" strokeDasharray="120 301.5"
                    style={{ filter: "drop-shadow(0 0 8px var(--neon-pink))" }} />
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <div className="font-display text-2xl font-semibold text-[var(--neon-pink)]">134</div>
              <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Blocked</div>
            </div>
          </div>
        </div>
        <ul className="space-y-2">
          {SECURITY_THREATS.map((t) => (
            <li key={t.label} className="flex items-center gap-3">
              <span className="w-32 truncate text-sm text-foreground/85">{t.label}</span>
              <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-white/[0.05]">
                <div className="absolute inset-y-0 left-0 rounded-full"
                     style={{ width: `${(t.value / max) * 100}%`, background: t.color, boxShadow: `0 0 12px ${t.color}` }} />
              </div>
              <span className="w-8 text-right font-mono text-xs text-foreground/80">{t.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function SelfHealing() {
  const data: { t: number; recovered: number; failed: number }[] = [];
  return (
    <div className="glass-card p-4 md:p-5">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-[var(--neon-green)]">
            <LifeBuoy className="h-3.5 w-3.5" /> Self-Healing
          </div>
          <h3 className="font-display text-base font-semibold">Recovery Engine</h3>
        </div>
        <div className="text-right">
          <div className="font-display text-2xl font-semibold text-[var(--neon-green)]">—</div>
          <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Recovery Rate</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { l: "Recovered", v: "0", c: "var(--neon-green)" },
          { l: "Retries",   v: "0", c: "var(--neon-cyan)" },
          { l: "Failed",    v: "0", c: "var(--neon-red)" },
        ].map((s) => (
          <div key={s.l} className="rounded-lg border border-white/5 bg-white/[0.02] px-2 py-2">
            <div className="font-display text-lg font-semibold" style={{ color: s.c }}>{s.v}</div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{s.l}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 h-32">
        <ResponsiveContainer>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="gRec" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--neon-green)" stopOpacity={0.5} />
                <stop offset="100%" stopColor="var(--neon-green)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="recovered" stroke="var(--neon-green)" strokeWidth={2} fill="url(#gRec)" />
            <Area type="monotone" dataKey="failed" stroke="var(--neon-red)" strokeWidth={1.5} fill="none" />
            <Tooltip contentStyle={{ background: "var(--surface-2)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 10, fontSize: 12 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {/* Recovery flow */}
      <div className="mt-2 flex items-center justify-between gap-2 rounded-lg border border-white/5 bg-white/[0.02] p-2 text-[11px]">
        {["Failure", "Retry", "Switch Model", "Success"].map((s, i, arr) => (
          <div key={s} className="flex items-center gap-2">
            <span className="rounded-md px-2 py-1"
                  style={{
                    background: i === 3 ? "oklch(0.85 0.21 155 / 0.16)" : "oklch(1 0 0 / 0.05)",
                    color: i === 3 ? "var(--neon-green)" : "var(--foreground)",
                  }}>{s}</span>
            {i < arr.length - 1 && <ChevronRight className="h-3 w-3 text-[var(--neon-cyan)] animate-glow-pulse" />}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProviderStatus() {
  return (
    <div className="glass-card p-4 md:p-5">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-[var(--neon-cyan)]">
            <Plug className="h-3.5 w-3.5" /> Providers
          </div>
          <h3 className="font-display text-base font-semibold">Provider Health</h3>
        </div>
        <button className="text-xs text-muted-foreground hover:text-foreground">View all →</button>
      </div>
      <StaggerGroup className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {PROVIDERS.map((p) => (
          <StaggerItem key={p.name} className="group relative overflow-hidden rounded-xl border border-white/5 bg-white/[0.02] p-3 transition-all hover:-translate-y-0.5 hover:border-white/10">
            <div className="absolute inset-x-0 -top-px h-px" style={{ background: `linear-gradient(90deg, transparent, ${p.color}, transparent)` }} />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-md" style={{ background: `${p.color}1f`, color: p.color }}>
                  <Brain className="h-3.5 w-3.5" />
                </span>
                <span className="text-sm font-medium">{p.name}</span>
              </div>
              <span className="h-2 w-2 rounded-full animate-pulse-dot"
                    style={{ background: p.health >= 95 ? "var(--neon-green)" : "var(--neon-amber)", color: p.health >= 95 ? "var(--neon-green)" : "var(--neon-amber)" }} />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-1.5 text-[11px]">
              <div className="rounded-md bg-white/[0.03] px-2 py-1">
                <div className="text-muted-foreground">Latency</div>
                <div className="font-mono text-foreground/90">{p.latency}ms</div>
              </div>
              <div className="rounded-md bg-white/[0.03] px-2 py-1">
                <div className="text-muted-foreground">Uptime</div>
                <div className="font-mono text-[var(--neon-green)]">{p.uptime}%</div>
              </div>
              <div className="rounded-md bg-white/[0.03] px-2 py-1">
                <div className="text-muted-foreground">Requests</div>
                <div className="font-mono">{p.requests.toLocaleString()}</div>
              </div>
              <div className="rounded-md bg-white/[0.03] px-2 py-1">
                <div className="text-muted-foreground">Avg Cost</div>
                <div className="font-mono">${p.avgCost.toFixed(3)}</div>
              </div>
            </div>
            <div className="mt-3">
              <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                <span>Health</span><span style={{ color: p.color }}>{p.health}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                <div className="h-full rounded-full" style={{ width: `${p.health}%`, background: p.color, boxShadow: `0 0 10px ${p.color}` }} />
              </div>
            </div>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </div>
  );
}

function ActivityTimeline() {
  return (
    <div className="glass-card flex h-full flex-col p-4 md:p-5">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-[var(--neon-violet)]">
            <ScrollText className="h-3.5 w-3.5" /> Timeline
          </div>
          <h3 className="font-display text-base font-semibold">Activity Stream</h3>
        </div>
        <span className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">Live</span>
      </div>
      <ol className="relative ml-2 flex-1 space-y-3 overflow-y-auto border-l border-white/10 pl-4 pr-1">
        {TIMELINE.map((e, i) => {
          const c = e.kind === "security" ? "var(--neon-pink)"
                 : e.kind === "route"    ? "var(--neon-violet)"
                 : e.kind === "heal"     ? "var(--neon-green)"
                 : e.kind === "switch"   ? "var(--neon-cyan)"
                 : e.kind === "cost"     ? "var(--neon-amber)"
                 : "var(--neon-violet)";
          return (
            <li key={i} className="relative animate-rise-in" style={{ animationDelay: `${i * 50}ms` }}>
              <span className="absolute -left-[22px] top-1.5 grid h-3 w-3 place-items-center rounded-full"
                    style={{ background: c, boxShadow: `0 0 10px ${c}` }} />
              <div className="text-xs text-foreground/90">{e.text}</div>
              <div className="mt-0.5 flex items-center gap-2 text-[10px] text-muted-foreground">
                <span className="font-mono">{e.t}</span>
                <span className="rounded-sm px-1 py-px" style={{ background: `${c}22`, color: c }}>{e.tag}</span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function Footer() {
  return (
    <footer className="glass-panel mt-4 flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 text-[11px] text-muted-foreground">
      <div className="flex items-center gap-3">
        <span className="font-mono">Demo build</span>
        <span>·</span>
        <span>Telemetry from the active demo session</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="rounded-md bg-[oklch(0.85_0.21_155/0.12)] px-1.5 py-0.5 text-[var(--neon-green)]">API · Operational</span>
        <span className="rounded-md bg-white/5 px-1.5 py-0.5 uppercase tracking-wider">Demo</span>
      </div>
    </footer>
  );
}

/* ---------------- Page ---------------- */

import { AppShell } from "@/components/app-shell";

function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  useEffect(() => {
    let active = true;
    fetch('/api/metrics', { cache: 'no-store' }).then((r) => r.ok ? r.json() : null).then((data) => { if (active && data) setMetrics(data as DashboardMetrics); }).catch(() => undefined);
    return () => { active = false; };
  }, []);
  const dashboardKpis = KPIS.map((k) => {
    if (!metrics) return k;
    const values: Record<string, number> = {
      'Total Requests': metrics.totalRequests, 'Successful': metrics.successful, 'Failed': metrics.failed, 'Recovered': metrics.recovered,
      "Today's Cost": metrics.totalCost, 'Money Saved': 0, 'Blocked Requests': metrics.blockedRequests, 'Avg Latency': metrics.avgLatencyMs,
      'Avg Tokens': metrics.avgTokens, 'Active Models': metrics.activeModels, 'Recovery Rate': metrics.recoveryRate, 'Gateway Health': metrics.gatewayHealth,
    };
    return { ...k, value: values[k.label] ?? 0, delta: metrics.totalRequests ? 'Live' : 'No data' };
  });
  return (
    <AppShell>
      <Hero />

      {/* KPI grid */}
      <section aria-label="Key metrics" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {dashboardKpis.map((k, i) => <KpiCard key={k.label} k={k} idx={i} />)}
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
        <TrendChart />
        <ModelUsage />
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
        <WorkflowGraph />
        <LiveRequests />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <SecurityCenter />
        <SelfHealing />
        <SystemHealth />
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1.4fr]">
        <CostIntelligence />
        <ProviderStatus />
      </section>

      <section className="grid grid-cols-1 gap-4">
        <ActivityTimeline />
      </section>

      <Footer />
    </AppShell>
  );
}

