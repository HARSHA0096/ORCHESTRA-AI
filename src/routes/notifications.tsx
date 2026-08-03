import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHero, Panel, Btn } from "@/components/app-shell";
import { BellRing, AlertTriangle, ShieldAlert, Sparkles, CheckCircle2, DollarSign, X, CheckCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Orchestra AI" },
      { name: "description", content: "All alerts: security, cost, recovery, deployments and quotas in one place." },
    ],
  }),
  component: NotificationsPage,
});

type Notif = {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  title: string;
  body: string;
  ts: string;
  cat: "security" | "cost" | "recovery" | "platform" | "providers" | "report";
  read: boolean;
};

const SEED: Notif[] = [
  { id: "n1", icon: ShieldAlert,  color: "var(--neon-red)",    title: "Prompt-injection burst blocked",   body: "14 attempts from 203.0.113.0/24 blocked by injection shield.", ts: "2m ago",  cat: "security",  read: false },
  { id: "n2", icon: DollarSign,   color: "var(--neon-amber)",  title: "Budget threshold reached",          body: "Atlas Copilot used 70% of monthly budget ($3,500 / $5,000).",  ts: "12m ago", cat: "cost",      read: false },
  { id: "n3", icon: CheckCircle2, color: "var(--neon-green)",  title: "Self-heal recovered OpenAI outage", body: "Routed 1,284 requests via Claude 3.5 for 14s.",                 ts: "32m ago", cat: "recovery",  read: false },
  { id: "n4", icon: Sparkles,     color: "var(--neon-violet)", title: "New model available: GPT-5-mini",   body: "Auto-add to routing pool? Quality 9.4, cost -28% vs GPT-4o.",  ts: "1h ago",  cat: "platform",  read: true  },
  { id: "n5", icon: AlertTriangle,color: "var(--neon-amber)",  title: "Gemini degraded",                   body: "Health 91% in eu-west. Traffic auto-shifted to us-east.",       ts: "2h ago",  cat: "providers", read: true  },
  { id: "n6", icon: BellRing,     color: "var(--neon-cyan)",   title: "Weekly digest ready",               body: "2.84M requests · $24,184 spend · 98.6% success.",               ts: "yesterday", cat: "report", read: true  },
];

const FILTERS = ["All", "Unread", "Security", "Cost", "Recovery", "Platform"] as const;

function NotificationsPage() {
  const [items, setItems] = useState<Notif[]>(SEED);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  const visible = useMemo(() => items.filter((n) => {
    if (filter === "All") return true;
    if (filter === "Unread") return !n.read;
    return n.cat === filter.toLowerCase();
  }), [items, filter]);

  const unread = items.filter((n) => !n.read).length;

  const markAllRead = () => {
    setItems((s) => s.map((n) => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };
  const toggleRead = (id: string) => setItems((s) => s.map((n) => n.id === id ? { ...n, read: !n.read } : n));
  const dismiss = (id: string) => {
    setItems((s) => s.filter((n) => n.id !== id));
    toast.message("Notification dismissed");
  };

  return (
    <AppShell>
      <PageHero
        eyebrow="Inbox · Realtime"
        title="Notifications"
        subtitle="All security, cost, deployment and provider alerts streamed into one consolidated, prioritized inbox."
        accent="var(--neon-pink)"
        actions={
          <Btn variant="secondary" onClick={markAllRead} disabled={unread === 0}>
            <CheckCheck className="h-4 w-4" /> Mark all read {unread > 0 && `(${unread})`}
          </Btn>
        }
      />

      <Panel
        eyebrow="Feed"
        title="Alerts"
        actions={
          <div className="flex flex-wrap gap-1.5 text-[11px]">
            {FILTERS.map((t) => (
              <button key={t} onClick={() => setFilter(t)}
                      className={`rounded-md px-2 py-1 transition-colors ${filter === t ? "bg-white/10 text-foreground" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"}`}>
                {t}
              </button>
            ))}
          </div>
        }
      >
        {visible.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/10 px-4 py-12 text-center">
            <BellRing className="mx-auto h-8 w-8 text-muted-foreground/60" />
            <div className="mt-3 font-display text-sm font-medium">You're all caught up</div>
            <div className="mt-1 text-xs text-muted-foreground">No notifications match this filter.</div>
          </div>
        ) : (
          <div className="space-y-2">
            {visible.map((n) => {
              const Icon = n.icon;
              return (
                <div key={n.id}
                     className={`group flex items-start gap-3 rounded-lg border border-white/5 p-3 transition-colors ${n.read ? "bg-white/[0.01] hover:bg-white/[0.03]" : "bg-white/[0.04] hover:bg-white/[0.06]"}`}>
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg"
                       style={{ background: `${n.color}1f`, color: n.color, boxShadow: `0 0 18px -8px ${n.color}` }}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <button onClick={() => toggleRead(n.id)} className="min-w-0 flex-1 text-left">
                    <div className="flex flex-wrap items-center gap-2">
                      {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-[var(--neon-violet)]" />}
                      <span className={`${n.read ? "font-normal" : "font-medium"}`}>{n.title}</span>
                      <span className="rounded-md border border-white/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{n.cat}</span>
                    </div>
                    <div className="mt-0.5 text-sm text-muted-foreground">{n.body}</div>
                  </button>
                  <span className="shrink-0 font-mono text-[11px] text-muted-foreground">{n.ts}</span>
                  <button onClick={() => dismiss(n.id)} aria-label="Dismiss"
                          className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:bg-white/5 hover:text-foreground group-hover:opacity-100">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </Panel>
    </AppShell>
  );
}
