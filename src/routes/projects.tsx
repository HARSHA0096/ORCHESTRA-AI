import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHero, Panel, StatCard, Modal, Btn } from "@/components/app-shell";
import { Boxes, Rocket, GitBranch, Users, Activity, Plus, Search, MoreHorizontal, Pencil, Copy, Archive, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { api, session } from "@/lib/api";

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
  env: string;
  reqs: string;
  spend: string;
  status: string;
  color: string;
  archived?: boolean;
};

const SEED: Project[] = [];

function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(SEED);
  const [q, setQ] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState<Project | null>(null);
  const [form, setForm] = useState({ name: "" });
  const [loadError, setLoadError] = useState("");
  const [selectedProject, setSelectedProject] = useState(() => session.projectId);

  useEffect(() => {
    if (!session.accessToken) return;
    api.get<any[]>("/api/v1/organizations").then(async (orgs) => {
      const org = orgs[0]; if (!org) return;
      const data = await api.get<any[]>(`/api/v1/organizations/${org.id}/projects`);
      const selection = data?.find((p) => p.id === session.projectId) ?? data?.[0];
      session.setProject(selection?.id ?? "", org.id);
      setSelectedProject(selection?.id ?? null);
      setProjects((data ?? []).map((p: any) => ({ id: p.id, name: p.name, env: "Not configured", reqs: "—", spend: "—", status: String(p.status ?? "unknown").toLowerCase(), color: "var(--neon-cyan)", archived: Boolean(p.archived) })));
    }).catch((error) => setLoadError(error instanceof Error ? error.message : "Unable to load projects. Check the gateway connection."));
  }, []);


  useEffect(() => {
    const close = () => setOpenMenu(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  const visible = useMemo(() => projects.filter((p) => {
    if (!showArchived && p.archived) return false;
    if (showArchived && !p.archived) return false;
    if (q && !p.name.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [projects, q, showArchived]);

  const openCreate = () => { setForm({ name: "" }); setCreateOpen(true); };
  const openEdit = (p: Project) => { setForm({ name: p.name }); setEditing(p); };

  const submitCreate = async () => {
    const name = form.name.trim();
    if (!name) { toast.error("Name is required"); return; }
    const orgId = session.organizationId;
    if (!orgId) { toast.error("Select or create an organization first"); return; }
    try {
      const p = await api.post<any>(`/api/v1/organizations/${orgId}/projects`, { name });
      setProjects((s) => [{ id: p.id, name: p.name, env: "Not configured", reqs: "—", spend: "—", status: String(p.status ?? "unknown").toLowerCase(), color: "var(--neon-cyan)" }, ...s]);
      session.setProject(p.id, orgId); setSelectedProject(p.id); toast.success(`Project "${name}" created`); setCreateOpen(false);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Unable to create project"); }
  };
  const submitEdit = async () => {
    if (!editing) return;
    const name = form.name.trim();
    if (!name) { toast.error("Name is required"); return; }
    try { await api.patch(`/api/v1/organizations/${session.organizationId}/projects/${editing.id}`, { name }); setProjects((s) => s.map((p) => p.id === editing.id ? { ...p, name } : p)); toast.success("Project updated"); setEditing(null); } catch (e) { toast.error(e instanceof Error ? e.message : "Unable to update project"); }
  };
  const duplicate = async (p: Project) => {
    try { const copy = await api.post<any>(`/api/v1/organizations/${session.organizationId}/projects/${p.id}/duplicate`, {}); setProjects((s) => [{ ...p, id: copy.id, name: copy.name }, ...s]); toast.success(`Duplicated "${p.name}"`); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Unable to duplicate project"); }
  };
  const archive = async (p: Project) => {
    try { await api.post(`/api/v1/organizations/${session.organizationId}/projects/${p.id}/archive`, {}); setProjects((s) => s.map((x) => x.id === p.id ? { ...x, archived: !x.archived } : x)); toast.message(p.archived ? "Project restored" : "Project archived"); } catch (e) { toast.error(e instanceof Error ? e.message : "Unable to archive project"); }
  };
  const confirmDelete = async () => {
    if (!deleting || !session.organizationId) return;
    try {
      await api.delete(`/api/v1/organizations/${session.organizationId}/projects/${deleting.id}`);
      setProjects((s) => s.filter((p) => p.id !== deleting.id)); toast.success(`Deleted "${deleting.name}"`); setDeleting(null);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Unable to delete project"); }
  };

  const active = projects.filter((p) => !p.archived).length;

  return (
    <AppShell>
      <PageHero
        eyebrow="Workspace · Projects"
        title="Projects"
        subtitle="Provision, monitor and govern every AI workload across environments. Each project carries its own routing strategy, security posture and cost budget."
        accent="var(--neon-violet)"
        actions={<Btn onClick={openCreate}><Plus className="h-4 w-4" /> New Project</Btn>}
      />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Active Projects" value={String(active)} delta="Current" color="var(--neon-violet)" icon={Boxes} />
        <StatCard label="Deployments (24h)" value="—" delta="No data" color="var(--neon-cyan)" icon={Rocket} />
        <StatCard label="Branches Tracked" value="—" delta="No data" color="var(--neon-pink)" icon={GitBranch} />
        <StatCard label="Team Members" value="—" delta="No data" color="var(--neon-green)" icon={Users} />
      </section>

      <Panel
        eyebrow="Portfolio"
        title={showArchived ? "Archived" : "All Projects"}
        actions={
          <div className="flex flex-wrap items-center gap-2">
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
        {loadError && <div role="alert" className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">Unable to load projects: {loadError}</div>}
        {visible.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/10 px-4 py-16 text-center">
            <Boxes className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <div className="mt-3 font-display text-base font-medium">No projects found</div>
            <div className="mt-1 text-xs text-muted-foreground">{q ? "Try clearing the search." : "Create your first project to get started."}</div>
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
                    <div className="mt-0.5 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Environment: {p.env}</div>
                    <button type="button" onClick={() => { session.setProject(p.id, session.organizationId ?? undefined); setSelectedProject(p.id); toast.success(`Selected ${p.name}`); }} className="mt-2 rounded border border-white/10 px-2 py-1 text-[10px] text-muted-foreground hover:text-foreground">{selectedProject === p.id ? "Selected project" : "Use project"}</button>
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
                  <div className="rounded-md bg-white/[0.03] p-2"><div className="text-[10px] uppercase tracking-wider text-muted-foreground">Requests</div><div className="mt-0.5 font-mono">{p.reqs}</div></div>
                  <div className="rounded-md bg-white/[0.03] p-2"><div className="text-[10px] uppercase tracking-wider text-muted-foreground">Spend</div><div className="mt-0.5 font-mono text-[var(--neon-green)]">{p.spend}</div></div>
                  <div className="rounded-md bg-white/[0.03] p-2">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">P95</div>
                    <div className="mt-0.5 font-mono">—</div>
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
  form: { name: string };
  setForm: (v: { name: string }) => void;
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
      </form>
    </Modal>
  );
}
