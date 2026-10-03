import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHero, Panel, StatCard, Modal, Btn } from "@/components/app-shell";
import { User, Mail, Shield, Activity, KeyRound, Pencil, LogOut, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api, session } from "@/lib/api";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Orchestra AI" },
      { name: "description", content: "Manage your personal account, sessions and API access." },
    ],
  }),
  component: ProfilePage,
});

type Identity = { name: string; email: string; mfa: string; sso: string; role: string };
type Session = { id: string; device: string; loc: string; ip: string; last: string };

const DEFAULT_ID: Identity = {
  name: "",
  email: "",
  mfa: "Not configured",
  sso: "Not configured",
  role: "—",
};
const SEED_SESS: Session[] = [];

function ProfilePage() {
  const [id, setId] = useState<Identity>(DEFAULT_ID);
  const [sessions, setSessions] = useState<Session[]>(SEED_SESS);
  const [edit, setEdit] = useState<{ k: keyof Identity; l: string } | null>(null);
  const [draft, setDraft] = useState("");
  const [revoke, setRevoke] = useState<Session | null>(null);
  const [signOutAll, setSignOutAll] = useState(false);

  useEffect(() => { let active = true; api.get<any>("/api/v1/auth/me").then((user) => { if (active) setId({ ...DEFAULT_ID, name: [user.firstName, user.lastName].filter(Boolean).join(" "), email: user.email ?? "", role: user.role ?? "—" }); }).catch((error) => toast.error(error instanceof Error ? error.message : "Unable to load profile")); api.get<any[]>("/api/v1/auth/sessions").then((items) => { if (active) setSessions((items ?? []).map((item: any) => ({ id: item.id, device: item.deviceName ?? item.userAgent ?? "Session", loc: "—", ip: item.ipAddress ?? "—", last: item.createdAt ? new Date(item.createdAt).toLocaleString() : "—" }))); }).catch((error) => toast.error(error instanceof Error ? error.message : "Unable to load sessions")); return () => { active = false; }; }, []);

  const openEdit = (k: keyof Identity, l: string) => { setDraft(id[k]); setEdit({ k, l }); };
  const saveEdit = () => {
    if (!edit) return;
    if (!draft.trim()) { toast.error("Cannot be empty"); return; }
    if (edit.k === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft)) { toast.error("Invalid email"); return; }
    if (edit.k !== "name") { toast.error("Email, MFA, and SSO changes are not configured for this account."); setEdit(null); return; }
    const [firstName, ...rest] = draft.trim().split(/\s+/);
    void api.patch("/api/v1/auth/me", { firstName, lastName: rest.join(" ") || firstName }).then(() => { setId((s) => ({ ...s, name: draft.trim() })); toast.success("Name updated"); }).catch((error) => toast.error(error instanceof Error ? error.message : "Unable to update name"));
    setEdit(null);
  };
  const initials = id.name.split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  const doRevoke = () => {
    if (!revoke) return;
    void api.delete(`/api/v1/auth/sessions/${revoke.id}`).then(() => { setSessions((s) => s.filter((x) => x.id !== revoke.id)); toast.success("Session revoked"); }).catch((error) => toast.error(error instanceof Error ? error.message : "Unable to revoke session"));
    setRevoke(null);
  };
  const doSignOutAll = () => {
    void api.delete("/api/v1/auth/sessions").then(() => { session.clear(); toast.success("All sessions revoked. Sign in again."); window.location.assign("/login"); }).catch((error) => toast.error(error instanceof Error ? error.message : "Unable to revoke sessions"));
    setSignOutAll(false);
  };

  return (
    <AppShell>
      <PageHero
        eyebrow="Account · Personal"
        title="Profile"
        subtitle="Your identity across Orchestra AI. Manage sessions, multi-factor settings and personal API access."
        accent="var(--neon-violet)"
        actions={<Btn variant="secondary" onClick={() => setSignOutAll(true)}><LogOut className="h-4 w-4" /> Sign out elsewhere</Btn>}
      />

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_2fr]">
        <Panel>
          <div className="flex flex-col items-center text-center">
            <div className="grid h-20 w-20 place-items-center rounded-full font-display text-2xl font-bold text-[oklch(0.16_0.04_270)]"
                 style={{ background: "var(--gradient-pink-violet)", boxShadow: "var(--shadow-glow-violet)" }}>{initials}</div>
            <div className="mt-3 font-display text-lg font-semibold">{id.name}</div>
            <div className="text-xs text-muted-foreground">Authenticated ORCHESTRA account</div>
            <div className="mt-4 grid w-full grid-cols-3 gap-2 text-xs">
              <div className="rounded-md bg-white/[0.03] p-2"><div className="text-[10px] uppercase tracking-wider text-muted-foreground">Role</div><div className="mt-0.5 font-mono text-[var(--neon-violet)]">{id.role}</div></div>
              <div className="rounded-md bg-white/[0.03] p-2"><div className="text-[10px] uppercase tracking-wider text-muted-foreground">MFA</div><div className="mt-0.5 font-mono">Not configured</div></div>
              <div className="rounded-md bg-white/[0.03] p-2"><div className="text-[10px] uppercase tracking-wider text-muted-foreground">SSO</div><div className="mt-0.5 font-mono">Not configured</div></div>
            </div>
          </div>
        </Panel>

        <div className="space-y-4">
          <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard label="API Calls (30d)" value="0" delta="No data" color="var(--neon-cyan)" icon={Activity} />
            <StatCard label="Personal Keys" value="—" delta="Deferred" color="var(--neon-violet)" icon={KeyRound} />
            <StatCard label="Projects" value="0" delta="No data" color="var(--neon-pink)" icon={User} />
            <StatCard label="Permissions"     value="full"  color="var(--neon-green)"  icon={Shield} />
          </section>

          <Panel eyebrow="Identity" title="Contact">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {[
                { icon: User,     k: "name" as const,  l: "Full name" },
                { icon: Mail,     k: "email" as const, l: "Email" },
                { icon: Shield,   k: "mfa" as const,   l: "MFA method" },
                { icon: KeyRound, k: "sso" as const,   l: "SSO provider" },
              ].map((f) => {
                const Icon = f.icon;
                return (
                  <button key={f.l} onClick={() => openEdit(f.k, f.l)} disabled={f.k !== "name"}
                          className="group flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3 text-left transition-colors hover:border-white/15 hover:bg-white/[0.04]">
                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-white/[0.04] text-[var(--neon-cyan)]"><Icon className="h-4 w-4" /></div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{f.l}</div>
                      <div className="truncate text-sm">{id[f.k]}</div>
                    </div>
                    <Pencil className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </button>
                );
              })}
            </div>
          </Panel>
        </div>
      </section>

      <Panel eyebrow="Security" title="Active Sessions">
        {sessions.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/10 px-4 py-10 text-center text-sm text-muted-foreground">No active sessions.</div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-white/5">
            <table className="w-full text-sm">
              <thead className="bg-white/[0.03] text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                <tr><th className="px-3 py-2 text-left">Device</th><th className="px-3 py-2 text-left">Location</th><th className="px-3 py-2 text-left">IP</th><th className="px-3 py-2 text-right">Last seen</th><th className="px-3 py-2 text-right" /></tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                    <td className="px-3 py-2.5">{s.device}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{s.loc}</td>
                    <td className="px-3 py-2.5 font-mono text-[12px] text-muted-foreground">{s.ip}</td>
                    <td className="px-3 py-2.5 text-right font-mono text-[12px]">{s.last}</td>
                    <td className="px-3 py-2.5 text-right">
                      {s.last === "Active now" ? <span className="text-[11px] text-muted-foreground/60">this device</span> :
                        <button onClick={() => setRevoke(s)} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-[var(--neon-red)] hover:bg-[oklch(0.7_0.25_25/0.12)]">
                          <Trash2 className="h-3 w-3" /> Revoke
                        </button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit ? `Edit · ${edit.l}` : ""}
             footer={<><Btn variant="secondary" onClick={() => setEdit(null)}>Cancel</Btn><Btn onClick={saveEdit}>Save</Btn></>}>
        <input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)}
               className="h-9 w-full rounded-md border border-white/10 bg-white/[0.03] px-3 text-sm focus:border-[var(--neon-violet)]/40 focus:outline-none focus:ring-1 focus:ring-[var(--neon-violet)]/30" />
      </Modal>
      <Modal open={!!revoke} onClose={() => setRevoke(null)} title="Revoke session"
             description={`Sign out ${revoke?.device} (${revoke?.loc})?`}
             footer={<><Btn variant="secondary" onClick={() => setRevoke(null)}>Cancel</Btn><Btn variant="danger" onClick={doRevoke}>Revoke</Btn></>}>
        <div className="text-xs text-muted-foreground">The user on that device will be signed out immediately.</div>
      </Modal>
      <Modal open={signOutAll} onClose={() => setSignOutAll(false)} title="Sign out of all other sessions"
             footer={<><Btn variant="secondary" onClick={() => setSignOutAll(false)}>Cancel</Btn><Btn variant="danger" onClick={doSignOutAll}>Sign out everywhere</Btn></>}>
        <div className="text-xs text-muted-foreground">All sessions except this device will be revoked. You'll stay signed in here.</div>
      </Modal>
    </AppShell>
  );
}
