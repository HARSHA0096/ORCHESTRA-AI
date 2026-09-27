import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHero, Panel, StatCard, Modal, Btn } from "@/components/app-shell";
import { KeyRound, Plus, Copy, Eye, EyeOff, Trash2, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/api-keys")({
  head: () => ({
    meta: [
      { title: "API Keys — Orchestra AI" },
      { name: "description", content: "Manage virtual API keys, scopes, rate limits and budgets per team or project." },
    ],
  }),
  component: ApiKeysPage,
});

type ApiKey = {
  id: string;
  name: string;
  key: string;
  scope: string;
  req: string;
  budget: string;
  status: "active" | "revoked";
};

const INITIAL: ApiKey[] = [];

const randomKey = () => {
  const hex = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
  return `sk_live_${hex}`;
};

function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>(INITIAL);
  const [show, setShow] = useState<Record<string, boolean>>({});
  const [q, setQ] = useState("");
  const [scope, setScope] = useState<string>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newScope, setNewScope] = useState("chat");
  const [confirmRevoke, setConfirmRevoke] = useState<ApiKey | null>(null);
  const [reveal, setReveal] = useState<{ name: string; key: string } | null>(null);

  const filtered = useMemo(() => {
    return keys.filter((k) =>
      (scope === "all" || k.scope.includes(scope)) &&
      (q === "" || k.name.toLowerCase().includes(q.toLowerCase()) || k.key.toLowerCase().includes(q.toLowerCase()))
    );
  }, [keys, q, scope]);

  const copy = async (k: ApiKey) => {
    try {
      await navigator.clipboard.writeText(k.key);
      toast.success("Key copied to clipboard", { description: k.name });
    } catch {
      toast.error("Unable to copy");
    }
  };

  const create = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) { toast.error("Name is required"); return; }
    if (keys.some((k) => k.name === name)) { toast.error("Name already exists"); return; }
    const k: ApiKey = { id: crypto.randomUUID(), name, key: randomKey(), scope: newScope, req: "0", budget: "$0", status: "active" };
    setKeys((s) => [k, ...s]);
    setCreateOpen(false);
    setNewName(""); setNewScope("chat");
    setReveal({ name: k.name, key: k.key });
    toast.success("API key created", { description: name });
  };

  const revoke = (k: ApiKey) => {
    setKeys((s) => s.filter((x) => x.id !== k.id));
    setConfirmRevoke(null);
    toast.success("Key revoked", { description: k.name });
  };

  const activeCount = keys.filter((k) => k.status === "active").length;

  return (
    <AppShell>
      <PageHero
        eyebrow="Credentials · Vaulted"
        title="API Keys"
        subtitle="Issue scoped virtual keys with per-key budgets, rate limits and audit trails. Rotate or revoke instantly without touching application code."
        accent="var(--neon-violet)"
        actions={<Btn onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" /> Create Key</Btn>}
      />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Active Keys"   value={String(activeCount)} color="var(--neon-violet)" icon={KeyRound} />
        <StatCard label="Revoked (30d)" value="0" delta="No data" color="var(--neon-red)" />
        <StatCard label="Avg Spend/Key" value="—" delta="Deferred" color="var(--neon-green)" />
        <StatCard label="Rate-Limited" value="0" delta="No data" color="var(--neon-amber)" />
      </section>

      <Panel
        eyebrow="Vault"
        title="Issued Keys"
        actions={
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search keys…"
                     className="h-8 w-48 rounded-md border border-white/10 bg-white/[0.03] pl-8 pr-7 text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-[var(--neon-violet)]/30" />
              {q && <button onClick={() => setQ("")} aria-label="Clear" className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="h-3 w-3" /></button>}
            </div>
            <select value={scope} onChange={(e) => setScope(e.target.value)}
                    className="h-8 rounded-md border border-white/10 bg-white/[0.03] px-2 text-xs focus:outline-none">
              <option value="all">All scopes</option>
              <option value="chat">chat</option>
              <option value="embed">embed</option>
              <option value="audit">audit</option>
            </select>
          </div>
        }
      >
        {filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/10 px-4 py-12 text-center">
            <KeyRound className="mx-auto h-8 w-8 text-muted-foreground/60" />
            <div className="mt-3 font-display text-sm font-medium">No keys match your filters</div>
            <div className="mt-1 text-xs text-muted-foreground">Try clearing search or scope filters.</div>
            <Btn variant="secondary" className="mt-4" onClick={() => { setQ(""); setScope("all"); }}>Clear filters</Btn>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-white/5">
            <table className="w-full text-sm">
              <thead className="bg-white/[0.03] text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">Name</th>
                  <th className="px-3 py-2 text-left">Key</th>
                  <th className="px-3 py-2 text-left">Scope</th>
                  <th className="px-3 py-2 text-right">Requests</th>
                  <th className="px-3 py-2 text-right">Spend (MTD)</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((k) => {
                  const visible = show[k.id];
                  return (
                    <tr key={k.id} className="border-t border-white/5 transition-colors hover:bg-white/[0.02]">
                      <td className="px-3 py-2.5 font-medium">{k.name}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <code className="rounded-md bg-white/[0.04] px-2 py-1 text-[12px] text-[var(--neon-cyan)]">
                            {visible ? k.key : k.key.slice(0, 8) + "•••••••••••••"}
                          </code>
                          <button onClick={() => setShow((s) => ({ ...s, [k.id]: !s[k.id] }))}
                                  className="text-muted-foreground hover:text-foreground" aria-label="Toggle visibility">
                            {visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                          <button onClick={() => copy(k)} className="text-muted-foreground hover:text-foreground" aria-label="Copy key">
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-[12px] text-muted-foreground">{k.scope}</td>
                      <td className="px-3 py-2.5 text-right font-mono">{k.req}</td>
                      <td className="px-3 py-2.5 text-right font-mono text-[var(--neon-green)]">{k.budget}</td>
                      <td className="px-3 py-2.5 text-right">
                        <button onClick={() => setConfirmRevoke(k)}
                                className="text-muted-foreground hover:text-[var(--neon-red)]" aria-label="Revoke">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create API Key"
        description="Issue a scoped virtual key. You'll see the full key only once."
        footer={
          <>
            <Btn variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Btn>
            <Btn onClick={create as never}>Generate Key</Btn>
          </>
        }
      >
        <form onSubmit={create} className="space-y-4">
          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">Name</span>
            <input autoFocus value={newName} onChange={(e) => setNewName(e.target.value)} maxLength={48}
                   placeholder="my-service-key"
                   className="mt-1 h-9 w-full rounded-md border border-white/10 bg-white/[0.03] px-3 text-sm focus:border-[var(--neon-violet)]/40 focus:outline-none focus:ring-1 focus:ring-[var(--neon-violet)]/30" />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">Scope</span>
            <select value={newScope} onChange={(e) => setNewScope(e.target.value)}
                    className="mt-1 h-9 w-full rounded-md border border-white/10 bg-white/[0.03] px-3 text-sm focus:outline-none">
              <option value="all">all</option>
              <option value="chat">chat</option>
              <option value="embed">embed</option>
              <option value="audit">audit</option>
            </select>
          </label>
        </form>
      </Modal>

      <Modal
        open={!!reveal}
        onClose={() => setReveal(null)}
        title="Your new API key"
        description="Copy and store this key securely — it won't be shown again."
        footer={<Btn onClick={() => setReveal(null)}>Done</Btn>}
      >
        {reveal && (
          <div className="space-y-3">
            <div className="text-xs text-muted-foreground">{reveal.name}</div>
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] p-3">
              <code className="flex-1 break-all font-mono text-[13px] text-[var(--neon-cyan)]">{reveal.key}</code>
              <button onClick={async () => { await navigator.clipboard.writeText(reveal.key); toast.success("Copied"); }}
                      className="grid h-8 w-8 place-items-center rounded-md bg-white/5 hover:bg-white/10" aria-label="Copy">
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={!!confirmRevoke}
        onClose={() => setConfirmRevoke(null)}
        title="Revoke this key?"
        description="Applications using this key will immediately stop working. This cannot be undone."
        footer={
          <>
            <Btn variant="secondary" onClick={() => setConfirmRevoke(null)}>Cancel</Btn>
            <Btn variant="danger" onClick={() => confirmRevoke && revoke(confirmRevoke)}>Revoke key</Btn>
          </>
        }
      >
        {confirmRevoke && (
          <div className="rounded-md border border-white/10 bg-white/[0.03] p-3 text-sm">
            <div className="font-medium">{confirmRevoke.name}</div>
            <div className="mt-1 font-mono text-xs text-muted-foreground">{confirmRevoke.key.slice(0, 14)}…</div>
          </div>
        )}
      </Modal>
    </AppShell>
  );
}
