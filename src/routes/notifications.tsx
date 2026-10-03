import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHero, Panel, Btn } from "@/components/app-shell";
import { BellRing, AlertTriangle, ShieldAlert, Sparkles, CheckCircle2, DollarSign, X, CheckCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";

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

const SEED: Notif[] = [];

const FILTERS = ["All", "Unread", "Security", "Cost", "Recovery", "Platform"] as const;

function NotificationsPage() {
  const [items, setItems] = useState<Notif[]>(SEED);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => { let active = true; api.get<any>("/api/v1/notifications?perPage=100").then((result) => { if (active) setItems((result ?? []).map((item: any) => ({ id: item.id, icon: item.category === "SECURITY" ? ShieldAlert : item.category === "COST" ? DollarSign : Sparkles, color: item.category === "SECURITY" ? "var(--neon-pink)" : "var(--neon-cyan)", title: item.title ?? item.type ?? "Notification", body: item.message ?? item.description ?? "", ts: item.createdAt ? new Date(item.createdAt).toLocaleString() : "—", cat: String(item.category ?? "platform").toLowerCase(), read: Boolean(item.readAt) }))); }).catch((err) => { if (active) setError(err instanceof Error ? err.message : "Unable to load notifications."); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, []);

  const visible = useMemo(() => items.filter((n) => {
    if (filter === "All") return true;
    if (filter === "Unread") return !n.read;
    return n.cat === filter.toLowerCase();
  }), [items, filter]);

  const unread = items.filter((n) => !n.read).length;

  const markAllRead = async () => { try { await api.patch("/api/v1/notifications/read-all", {}); setItems((s) => s.map((n) => ({ ...n, read: true }))); toast.success("All notifications marked as read"); } catch (err) { toast.error(err instanceof Error ? err.message : "Unable to update notifications"); } };
  const toggleRead = async (id: string) => { try { await api.patch(`/api/v1/notifications/${id}/read`, {}); setItems((s) => s.map((n) => n.id === id ? { ...n, read: true } : n)); } catch (err) { toast.error(err instanceof Error ? err.message : "Unable to update notification"); } };

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
        {error && <div role="alert" className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">Unable to load notifications: {error}</div>}
        {loading ? <div role="status" className="py-8 text-center text-sm text-muted-foreground">Loading notifications…</div> : visible.length === 0 ? (
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
                  <span aria-label="Dismiss unavailable"
                          className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-muted-foreground opacity-50">
                    <X className="h-3.5 w-3.5" />
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Panel>
    </AppShell>
  );
}
