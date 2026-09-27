import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Bell, Boxes, ChevronLeft, ChevronsUpDown, Command, Gauge,
  History, KeyRound, LayoutDashboard, LifeBuoy, LineChart as LineIcon,
  Moon, Network, Plug, Radar, Router as RouterIcon, Search, Settings,
  Shield, Sparkles, Sun, User, BellRing, X,
} from "lucide-react";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { AmbientField } from "@/components/ambient-field";
import { PageTransition, springSnappy, springSoft, EASE } from "@/lib/motion";

export type NavItem = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  to: string;
  shortcut?: string;
  badge?: string;
};

type NavGroup = { label: string; items: NavItem[] };

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Operate",
    items: [
      { icon: LayoutDashboard, label: "Dashboard",  to: "/",         shortcut: "⌘1" },
      { icon: Boxes,           label: "Projects",   to: "/projects", shortcut: "⌘2" },
      { icon: Network,         label: "Gateway",    to: "/gateway",  shortcut: "⌘3" },
      { icon: Shield,          label: "Security",   to: "/security", shortcut: "⌘4",  },
      { icon: KeyRound,        label: "API Keys",   to: "/api-keys" },
      { icon: History,         label: "History",    to: "/history" },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { icon: Gauge,       label: "Cost Intelligence", to: "/cost",          shortcut: "⌘5" },
      { icon: RouterIcon,  label: "Model Router",      to: "/router",        shortcut: "⌘6" },
      { icon: LifeBuoy,    label: "Self-Healing",      to: "/self-healing",  shortcut: "⌘7" },
      { icon: Radar,       label: "Observability",     to: "/observability", shortcut: "⌘8" },
      { icon: Plug,        label: "Providers",         to: "/providers",     shortcut: "⌘9" },
    ],
  },
  {
    label: "Workspace",
    items: [
      { icon: LineIcon,   label: "Analytics",     to: "/analytics" },
      { icon: BellRing,   label: "Notifications", to: "/notifications",  },
      { icon: Settings,   label: "Settings",      to: "/settings" },
      { icon: User,       label: "Profile",       to: "/profile" },
    ],
  },
];

// Flat list kept for the command palette
export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);

function NavLink({ it, collapsed }: { it: NavItem; collapsed: boolean }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const Icon = it.icon;
  const active = it.to === "/" ? pathname === "/" : pathname.startsWith(it.to);
  return (
    <Link
      to={it.to}
      title={collapsed ? it.label : undefined}
      className={`group relative flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-sm transition-all duration-300 ${
        active
          ? "text-foreground"
          : "text-muted-foreground hover:translate-x-0.5 hover:text-foreground"
      }`}
    >
      {active && (
        <>
          <motion.span
            layoutId="nav-active-pill"
            transition={springSnappy}
            className="absolute inset-0 rounded-xl"
            style={{
              background:
                "linear-gradient(90deg, oklch(0.7 0.24 295 / 0.22), oklch(0.84 0.16 210 / 0.10) 60%, transparent)",
              boxShadow: "inset 0 0 0 1px oklch(0.7 0.24 295 / 0.35)",
            }}
          />
          <motion.span
            layoutId="nav-active-rail"
            transition={springSnappy}
            className="absolute left-0 top-1.5 h-[calc(100%-12px)] w-[3px] rounded-r-full animate-glow-pulse"
            style={{ background: "var(--gradient-violet-cyan)", color: "var(--neon-violet)" }}
          />
        </>
      )}
      {!active && (
        <span className="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{ background: "linear-gradient(90deg, oklch(1 0 0 / 0.05), transparent)" }} />
      )}
      <Icon className={`relative h-4 w-4 shrink-0 transition-all duration-300 ${
        active ? "text-[var(--neon-cyan)] drop-shadow-[0_0_6px_var(--neon-cyan)]" : "group-hover:text-[var(--neon-cyan)]"
      }`} />
      {!collapsed && (
        <>
          <span className="relative flex-1 truncate text-left">{it.label}</span>
          {it.badge && (
            <span className="relative rounded-md bg-[oklch(0.7_0.24_295/0.22)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--neon-violet)] ring-1 ring-inset ring-[var(--neon-violet)]/30">
              {it.badge}
            </span>
          )}
          {it.shortcut && !it.badge && (
            <span className="relative font-mono text-[10px] text-muted-foreground/60">{it.shortcut}</span>
          )}
        </>
      )}
    </Link>
  );
}

function Sidebar({ collapsed, setCollapsed }: { collapsed: boolean; setCollapsed: (v: boolean) => void }) {
  return (
    <motion.aside
      className="glass-panel sticky top-4 hidden h-[calc(100vh-2rem)] flex-col p-3 md:flex"
      animate={{ width: collapsed ? 78 : 252 }}
      transition={springSoft}
    >
      {/* Brand */}
      <div className="mb-5 flex items-center gap-3 px-1.5">
        <Link to="/" className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl"
              style={{ background: "var(--gradient-violet-cyan)", boxShadow: "var(--shadow-glow-violet)" }}>
          <Sparkles className="h-5 w-5 text-[oklch(0.16_0.04_270)]" />
        </Link>
        {!collapsed && (
          <div className="min-w-0">
            <div className="font-display text-[15px] font-semibold tracking-wide leading-none">ORCHESTRA</div>
            <div className="mt-1 truncate text-[10px] uppercase tracking-[0.22em] text-muted-foreground">AI Control</div>
          </div>
        )}
      </div>

      {/* Grouped nav */}
      <nav className="flex-1 space-y-4 overflow-y-auto pr-1">
        {NAV_GROUPS.map((g) => (
          <div key={g.label} className="space-y-0.5">
            {!collapsed && (
              <div className="px-2.5 pb-1.5 text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground/70">
                {g.label}
              </div>
            )}
            {g.items.map((it) => <NavLink key={it.to} it={it} collapsed={collapsed} />)}
          </div>
        ))}
      </nav>

      {/* Status + collapse */}
      <div className="mt-3 space-y-2 border-t border-white/5 pt-3">
        {!collapsed ? (
          <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2">
            <span className="relative inline-flex h-2 w-2 shrink-0">
              <span className="absolute inset-0 animate-ping rounded-full bg-[var(--neon-green)] opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--neon-green)]" />
            </span>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="text-[12px] font-medium">All systems</div>
              <div className="truncate text-[11px] text-muted-foreground">operational</div>
            </div>
          </div>
        ) : (
          <div className="grid h-9 w-full place-items-center">
            <span className="relative inline-flex h-2 w-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-[var(--neon-green)] opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--neon-green)]" />
            </span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/[0.04] hover:text-foreground"
        >
          <ChevronLeft className={`h-4 w-4 shrink-0 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} />
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </motion.aside>
  );
}

function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
    if (!open) setQ("");
  }, [open]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const items = NAV_ITEMS.filter((i) => i.label.toLowerCase().includes(q.toLowerCase()));

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 p-4 pt-[12vh] backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <motion.div
            className="glass-card w-full max-w-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={springSnappy}
          >
            <div className="flex items-center gap-3 border-b border-white/5 px-4 py-3">
              <Search className="h-4 w-4 text-[var(--neon-cyan)]" />
              <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)}
                     placeholder="Jump to a module, search anything…"
                     className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground/60 focus:outline-none" />
              <kbd className="font-mono text-[10px] text-muted-foreground">ESC</kbd>
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              {items.length === 0 ? (
                <div className="px-3 py-6 text-center text-sm text-muted-foreground">No results for "{q}"</div>
              ) : items.map((it, i) => {
                const Icon = it.icon;
                return (
                  <motion.button
                    key={it.to}
                    onClick={() => { navigate({ to: it.to }); onClose(); }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-white/5"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02, duration: 0.2 }}
                    whileHover={{ x: 2 }}
                  >
                    <Icon className="h-4 w-4 text-[var(--neon-cyan)]" />
                    <span className="flex-1">{it.label}</span>
                    {it.shortcut && <span className="font-mono text-[10px] text-muted-foreground">{it.shortcut}</span>}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function TopBar() {
  const [q, setQ] = useState("");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [dark, setDark] = useState(true);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault(); setPaletteOpen(true);
      }
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault(); searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    navigate({ to: "/history", search: { q: q.trim() } as never });
  };

  const toggleTheme = () => {
    setDark((d) => {
      const next = !d;
      document.documentElement.classList.toggle("dark", next);
      toast.success(next ? "Dark theme enabled" : "Light theme enabled");
      return next;
    });
  };

  return (
    <>
      <div className="glass-panel flex items-center gap-3 px-3 py-2.5">
        {/* Workspace pill */}
        <button
          onClick={() => toast.message("Workspace switcher", { description: "Core Platform / Orchestra Labs" })}
          className="flex shrink-0 items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-2 py-1.5 text-left hover:bg-white/[0.06]"
          aria-label="Switch workspace"
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg font-display text-[11px] font-bold text-[oklch(0.16_0.04_270)]"
                style={{ background: "var(--gradient-violet-cyan)", boxShadow: "0 0 14px -4px var(--neon-violet)" }}>
            CP
          </span>
          <span className="hidden flex-col leading-tight sm:flex">
            <span className="text-[12.5px] font-semibold">Core Platform</span>
            <span className="text-[10px] text-muted-foreground">Orchestra Labs</span>
          </span>
          <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>

        {/* Search */}
        <form onSubmit={submit} className="relative flex min-w-0 flex-1 items-center">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
          <input
            ref={searchRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search or run a command"
            className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.03] pl-9 pr-20 text-sm placeholder:text-muted-foreground/60 focus:border-[var(--neon-violet)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--neon-violet)]/20"
          />
          {q ? (
            <button type="button" onClick={() => setQ("")} aria-label="Clear search"
                    className="absolute right-2 grid h-6 w-6 place-items-center rounded-md text-muted-foreground hover:bg-white/5 hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button type="button" onClick={() => setPaletteOpen(true)}
                    className="pointer-events-auto absolute right-2 hidden items-center gap-1 rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground hover:bg-white/10 sm:flex"
                    aria-label="Open command palette">
              <span>Ctrl</span><span>K</span>
            </button>
          )}
        </form>

        {/* Right side */}
        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden items-center gap-2 rounded-full border border-[var(--neon-green)]/30 bg-[oklch(0.85_0.21_155/0.10)] px-3 py-1.5 text-xs font-medium text-[var(--neon-green)] sm:flex">
            <span className="relative inline-flex h-2 w-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-[var(--neon-green)] opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--neon-green)]" />
            </span>
            Operational
          </span>

          <button onClick={toggleTheme} className="grid h-9 w-9 place-items-center rounded-lg bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground" aria-label="Toggle theme" title="Toggle theme">
            {dark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4 text-[var(--neon-amber)]" />}
          </button>

          <Link to="/notifications" className="relative grid h-9 w-9 place-items-center rounded-lg bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground" aria-label="Notifications">
            <Bell className="h-4 w-4" />
            <span className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-full bg-[var(--neon-pink)] text-[9px] font-semibold text-[oklch(0.16_0.04_270)]">12</span>
          </Link>

          <Link to="/profile" aria-label="Profile"
                className="grid h-9 w-9 place-items-center rounded-full font-display text-[11px] font-bold text-[oklch(0.16_0.04_270)] ring-1 ring-white/10 hover:brightness-110"
                style={{ background: "var(--gradient-pink-violet)" }}>
            AO
          </Link>
        </div>
      </div>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("orchestra.sidebar.collapsed") === "1";
  });
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("orchestra.sidebar.collapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="dark relative min-h-screen text-foreground">
      <AmbientField />
      <div className="mx-auto flex max-w-[1600px] gap-4 p-4">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        <main className="min-w-0 flex-1 space-y-4">
          <TopBar />
          {import.meta.env.VITE_DEMO_MODE === 'true' && (
            <div className="flex items-center justify-between rounded-xl border border-[var(--neon-cyan)]/25 bg-[oklch(0.84_0.16_210/0.08)] px-3 py-2 text-xs">
              <span className="font-medium text-[var(--neon-cyan)]">DEMO MODE</span>
              <span className="text-muted-foreground">Deterministic provider · No external AI API key required</span>
            </div>
          )}
          <PageTransition id={pathname}>{children}</PageTransition>
        </main>
      </div>
    </div>
  );

}

/* ---------- Shared building blocks for module pages ---------- */

export function PageHero({
  eyebrow, title, subtitle, accent = "var(--neon-violet)", actions,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  accent?: string;
  actions?: ReactNode;
}) {
  return (
    <motion.section
      className="glass-card gradient-ring relative overflow-hidden p-6 md:p-8"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: EASE }}
    >
      <div className="absolute inset-0 grid-bg opacity-25" />
      <div className="absolute -left-20 -top-24 h-72 w-72 rounded-full blur-3xl animate-float-orb"
           style={{ background: `${accent}`, opacity: 0.28 }} />
      <div className="absolute -right-16 -bottom-24 h-80 w-80 rounded-full blur-3xl animate-float-orb"
           style={{ background: "oklch(0.84 0.16 210 / 0.25)", animationDelay: "2s" }} />
      <div className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent animate-sheen" />
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <motion.div
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.22em] backdrop-blur"
            style={{ color: accent }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            <span className="h-1.5 w-1.5 rounded-full animate-pulse-dot" style={{ background: accent, color: accent }} />
            {eyebrow}
          </motion.div>
          <motion.h1
            className="mt-4 font-display text-3xl font-semibold tracking-tight md:text-[2.6rem] md:leading-[1.05]"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
          >
            <span className="text-gradient">{title}</span>
          </motion.h1>
          {subtitle && (
            <motion.p
              className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-[15px]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.16 }}
            >
              {subtitle}
            </motion.p>
          )}
        </div>
        {actions && (
          <motion.div
            className="flex shrink-0 flex-wrap items-center gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {actions}
          </motion.div>
        )}
      </div>
    </motion.section>
  );
}

export function StatCard({
  label, value, delta, color = "var(--neon-violet)", icon: Icon,
}: {
  label: string;
  value: string;
  delta?: string;
  color?: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  const positive = delta?.trim().startsWith("+");
  return (
    <motion.div
      className="glass-card group relative p-4"
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-30px" }}
      whileHover={{ y: -3, borderColor: "oklch(0.82 0.16 210 / 0.3)" }}
      transition={{ duration: 0.4, ease: EASE }}
    >
      <div className="absolute inset-x-0 -top-px h-px transition-opacity"
           style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-60"
           style={{ background: color }} />
      <div className="relative flex items-start justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{label}</div>
          <div className="mt-1 font-display text-2xl font-semibold tabular-nums tracking-tight">{value}</div>
        </div>
        {Icon && (
          <div className="grid h-10 w-10 place-items-center rounded-xl transition-transform duration-300 group-hover:scale-110"
               style={{ background: `${color}1f`, color, boxShadow: `0 0 22px -8px ${color}, inset 0 0 0 1px ${color}33` }}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      {delta && (
        <span className={`relative mt-3 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium ${
          positive ? "text-[var(--neon-green)] bg-[oklch(0.85_0.21_155/0.12)]" : "text-[var(--neon-red)] bg-[oklch(0.7_0.25_25/0.12)]"
        }`}>
          {delta}
        </span>
      )}
    </motion.div>
  );
}

export function Panel({
  title, eyebrow, actions, children, className = "",
}: {
  title?: string;
  eyebrow?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={`glass-card p-4 md:p-5 ${className}`}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      whileHover={{ y: -2, borderColor: "oklch(0.82 0.16 210 / 0.25)" }}
      transition={{ duration: 0.45, ease: EASE }}
    >
      {(title || actions) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            {eyebrow && (
              <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{eyebrow}</div>
            )}
            {title && <div className="font-display text-lg font-semibold tracking-tight">{title}</div>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </motion.div>
  );
}

/* ---------- Reusable Modal primitive (ESC, outside-click, focus, no-scroll) ---------- */

export function Modal({
  open, onClose, title, description, children, footer, size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);
  const maxW = size === "sm" ? "max-w-sm" : size === "lg" ? "max-w-3xl" : "max-w-lg";
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog" aria-modal="true" aria-label={title}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <motion.div
            className={`glass-card relative w-full ${maxW} overflow-hidden`}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 6 }}
            transition={springSnappy}
          >
            <button onClick={onClose} aria-label="Close" className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-white/5 hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
            {(title || description) && (
              <div className="border-b border-white/5 px-5 py-4">
                {title && <div className="font-display text-base font-semibold tracking-tight">{title}</div>}
                {description && <div className="mt-1 text-xs text-muted-foreground">{description}</div>}
              </div>
            )}
            <div className="px-5 py-4">{children}</div>
            {footer && <div className="flex items-center justify-end gap-2 border-t border-white/5 bg-white/[0.02] px-5 py-3">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Btn({
  variant = "primary", className = "", ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" | "ghost" }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none";
  const v = {
    primary: "text-[oklch(0.16_0.04_270)] hover:brightness-110",
    secondary: "border border-white/10 bg-white/[0.04] text-foreground hover:bg-white/[0.08]",
    danger: "border border-[var(--neon-red)]/40 bg-[oklch(0.7_0.25_25/0.12)] text-[var(--neon-red)] hover:bg-[oklch(0.7_0.25_25/0.22)]",
    ghost: "text-muted-foreground hover:bg-white/5 hover:text-foreground",
  }[variant];
  const style = variant === "primary" ? { background: "var(--gradient-violet-cyan)", boxShadow: "var(--shadow-glow-violet)" } : undefined;
  return (
    <motion.button
      className={`${base} ${v} ${className}`}
      style={style}
      whileHover={rest.disabled ? undefined : { scale: 1.02 }}
      whileTap={rest.disabled ? undefined : { scale: 0.97 }}
      transition={springSnappy}
      {...(rest as any)}
    />
  );
}
