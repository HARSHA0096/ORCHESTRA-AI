import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHero, Panel, StatCard, Modal, Btn } from "@/components/app-shell";
import { Boxes, Rocket, GitBranch, Users, Activity, Plus, Search, MoreHorizontal, Pencil, Copy, Archive, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects — Orchestra AI" },
      { name: "description", content: "Manage AI projects, environments and deployments across your organization." },
    ],
  }),
  component: ProjectsPage,
});

type Project = {
  id: string;
  name: string;
  env: "prod" | "staging" | "dev";
  models: number;
  reqs: string;
  spend: string;
  status: "healthy" | "guarded" | "degraded";
  color: string;
  archived?: boolean;
};

const SEED: Project[] = [];

const STORAGE = "orchestra.projects";
const ENV_COLORS: Record<Project["env"], string> = {
  prod: "var(--neon-green)", staging: "var(--neon-cyan)", dev: "var(--neon-amber)",
};

function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(SEED);
  const [q, setQ] = useState("");
  const [envFilter, setEnvFilter] = useState<"all" | Project["env"]>("all");
  const [showArchived, setShowArchived] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState<Project | null>(null);
  const [form, setForm] = useState({ name: "", env: "dev" as Project["env"] });

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE);
      if (raw) setProjects(JSON.parse(raw));
    } catch { /* noop */ }
  }, []);
  useEffect(() => {
    window.localStorage.setItem(STORAGE, JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    const close = () => setOpenMenu(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  const visible = useMemo(() => projects.filter((p) => {
    if (!showArchived && p.archived) return false;
    if (showArchived && !p.archived) return false;
    if (envFilter !== "all" && p.env !== envFilter) return false;
    if (q && !p.name.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [projects, q, envFilter, showArchived]);

  const openCreate = () => { setForm({ name: "", env: "dev" }); setCreateOpen(true); };
  const openEdit = (p: Project) => { setForm({ name: p.name, env: p.env }); setEditing(p); };

  const submitCreate = () => {
    const name = form.name.trim();
    if (!name) { toast.error("Name is required"); return; }
    const id = `p${Date.now()}`;
    setProjects((s) => [{ id, name, env: form.env, models: 0, reqs: "0", spend: "$0", status: "healthy", color: ENV_COLORS[form.env] }, ...s]);
    toast.success(`Project "${name}" created`);
    setCreateOpen(false);
  };
  const submitEdit = () => {
    if (!editing) return;
    const name = form.name.trim();
    if (!name) { toast.error("Name is required"); return; }
    setProjects((s) => s.map((p) => p.id === editing.id ? { ...p, name, env: form.env, color: ENV_COLORS[form.env] } : p));
    toast.success("Project updated");
    setEditing(null);
  };
  const duplicate = (p: Project) => {
    setProjects((s) => [{ ...p, id: `p${Date.now()}`, name: `${p.name} (copy)` }, ...s]);
    toast.success(`Duplicated "${p.name}"`);
  };
  const archive = (p: Project) => {
    setProjects((s) => s.map((x) => x.id === p.id ? { ...x, archived: !x.archived } : x));
    toast.message(p.archived ? "Project restored" : "Project archived");
  };
  const confirmDelete = () => {
    if (!deleting) return;
    setProjects((s) => s.filter((p) => p.id !== deleting.id));
    toast.success(`Deleted "${deleting.name}"`);
    setDeleting(null);
  };

  const active = projects.filter((p) => !p.archived).length;

  return (
    <AppShell>
      <PageHero
        eyebrow="Workspace · ORCHESTRA Demo"
        title="Projects"
        subtitle="Provision, monitor and govern every AI workload across environments. Each project carries its own routing strategy, security posture and cost budget."
        accent="var(--neon-violet)"
        actions={<Btn onClick={openCreate}><Plus className="h-4 w-4" /> New Project</Btn>}
      />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Active Projects" value={String(active)} delta="Current" color="var(--neon-violet)" icon={Boxes} />
        <StatCard label="Deployments (24h)" value="0" delta="No data" color="var(--neon-cyan)" icon={Rocket} />
        <StatCard label="Branches Tracked" value="0" delta="No data" color="var(--neon-pink)" icon={GitBranch} />
        <StatCard label="Team Members" value="0" delta="No data" color="var(--neon-green)" icon={Users} />
      </section>

      <Panel
        eyebrow="Portfolio"
        title={showArchived ? "Archived" : "All Projects"}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex gap-1 rounded-md border border-white/10 bg-white/[0.03] p-0.5 text-[11px]">
              {(["all", "prod", "staging", "dev"] as const).map((e) => (
                <button key={e} onClick={() => setEnvFilter(e)}
                        className={`rounded px-2 py-1 capitalize transition-colors ${envFilter === e ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground"}`}>{e}</button>
              ))}
            </div>
            <button onClick={() => setShowArchived((v) => !v)}
                    className={`rounded-md border border-white/10 px-2 py-1 text-[11px] ${showArchived ? "bg-white/10 text-foreground" : "bg-white/[0.03] text-muted-foreground hover:text-foreground"}`}>
              {showArchived ? "Showing archived" : "Show archived"}
            </button>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search projects…"
                     className="h-8 w-44 rounded-md border border-white/10 bg-white/[0.03] pl-8 pr-3 text-xs focus:border-[var(--neon-violet)]/40 focus:outline-none" />
            </div>
          </div>
        }
      >
        {visible.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/10 px-4 py-16 text-center">
            <Boxes className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <div className="mt-3 font-display text-base font-medium">No projects found</div>
            <div className="mt-1 text-xs text-muted-foreground">{q || envFilter !== "all" ? "Try clearing filters." : "Create your first project to get started."}</div>
            <div className="mt-4 flex justify-center"><Btn onClick={openCreate}><Plus className="h-4 w-4" /> New Project</Btn></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {visible.map((p) => (
              <div key={p.id} className="group relative rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-all hover:-translate-y-0.5 hover:border-white/20">
                <div className="absolute inset-x-0 -top-px h-px"
                     style={{ background: `linear-gradient(90deg, transparent, ${p.color}, transparent)` }} />
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate font-display text-base font-semibold">{p.name}</div>
                    <div className="mt-0.5 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{p.env} · {p.models} models</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-1.5 py-0.5 text-[10px]" style={{ color: p.color }}>
                      <span className="h-1.5 w-1.5 rounded-full animate-pulse-dot" style={{ background: p.color, color: p.color }} />
                      {p.status}
                    </span>
                    <div className="relative">
                      <button onClick={(e) => { e.stopPropagation(); setOpenMenu((m) => m === p.id ? null : p.id); }}
                              aria-label="Project actions"
                              className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-white/5 hover:text-foreground">
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </button>
                      {openMenu === p.id && (
                        <div onClick={(e) => e.stopPropagation()} className="glass-card absolute right-0 top-full z-20 mt-1 w-44 overflow-hidden p-1 text-sm animate-scale-in">
                          {[
                            { l: "Edit", i: Pencil, a: () => { openEdit(p); setOpenMenu(null); } },
                            { l: "Duplicate", i: Copy, a: () => { duplicate(p); setOpenMenu(null); } },
                            { l: p.archived ? "Restore" : "Archive", i: Archive, a: () => { archive(p); setOpenMenu(null); } },
                          ].map((it) => {
                            const I = it.i;
                            return (
                              <button key={it.l} onClick={it.a} className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-white/5">
                                <I className="h-3.5 w-3.5 text-muted-foreground" /> {it.l}
                              </button>
                            );
                          })}
                          <div className="my-1 border-t border-white/5" />
                          <button onClick={() => { setDeleting(p); setOpenMenu(null); }} className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[var(--neon-red)] hover:bg-[oklch(0.7_0.25_25/0.15)]">
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                  <div className="rounded-md bg-white/[0.03] p-2">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Reqs</div>
                    <div className="mt-0.5 font-mono">{p.reqs}</div>
                  </div>
                  <div className="rounded-md bg-white/[0.03] p-2">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Spend</div>
                    <div className="mt-0.5 font-mono text-[var(--neon-green)]">{p.spend}</div>
                  </div>
                  <div className="rounded-md bg-white/[0.03] p-2">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">P95</div>
                    <div className="mt-0.5 font-mono">412ms</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Activity className="h-3 w-3" /> Live</span>
                  <span>Updated 2 min ago</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <ProjectFormModal open={createOpen} title="New Project" form={form} setForm={setForm}
                        onClose={() => setCreateOpen(false)} onSubmit={submitCreate} cta="Create project" />
      <ProjectFormModal open={!!editing} title={`Edit · ${editing?.name ?? ""}`} form={form} setForm={setForm}
                        onClose={() => setEditing(null)} onSubmit={submitEdit} cta="Save changes" />

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Delete project"
             description={`This will permanently remove "${deleting?.name}". This cannot be undone.`}
             footer={
               <>
                 <Btn variant="secondary" onClick={() => setDeleting(null)}>Cancel</Btn>
                 <Btn variant="danger" onClick={confirmDelete}><Trash2 className="h-4 w-4" /> Delete project</Btn>
               </>
             }
      >
        <div className="rounded-lg border border-[var(--neon-red)]/30 bg-[oklch(0.7_0.25_25/0.08)] p-3 text-xs text-muted-foreground">
          All routing rules, budgets and historical logs scoped to this project will be removed from your workspace.
        </div>
      </Modal>
    </AppShell>
  );
}

function ProjectFormModal({
  open, title, form, setForm, onClose, onSubmit, cta,
}: {
  open: boolean; title: string;
  form: { name: string; env: Project["env"] };
  setForm: (v: { name: string; env: Project["env"] }) => void;
  onClose: () => void; onSubmit: () => void; cta: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { if (open) setTimeout(() => ref.current?.focus(), 50); }, [open]);
  return (
    <Modal open={open} onClose={onClose} title={title}
           footer={<><Btn variant="secondary" onClick={onClose}>Cancel</Btn><Btn onClick={onSubmit}>{cta}</Btn></>}>
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-3">
        <div>
          <label className="mb-1 block text-[11px] uppercase tracking-wider text-muted-foreground">Name</label>
          <input ref={ref} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required maxLength={64}
                 placeholder="e.g. Atlas Copilot"
                 className="h-9 w-full rounded-md border border-white/10 bg-white/[0.03] px-3 text-sm focus:border-[var(--neon-violet)]/40 focus:outline-none focus:ring-1 focus:ring-[var(--neon-violet)]/30" />
        </div>
        <div>
          <label className="mb-1 block text-[11px] uppercase tracking-wider text-muted-foreground">Environment</label>
          <div className="grid grid-cols-3 gap-2">
            {(["dev", "staging", "prod"] as const).map((e) => (
              <button key={e} type="button" onClick={() => setForm({ ...form, env: e })}
                      className={`rounded-md border px-3 py-2 text-sm capitalize transition-colors ${form.env === e ? "border-[var(--neon-violet)]/50 bg-[oklch(0.7_0.24_295/0.15)] text-foreground" : "border-white/10 bg-white/[0.03] text-muted-foreground hover:text-foreground"}`}>
                {e}
              </button>
            ))}
          </div>
        </div>
      </form>
    </Modal>
  );
}
