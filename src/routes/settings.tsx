import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHero, Panel, Btn, Modal } from "@/components/app-shell";
import { Settings as SettingsIcon, Bell, Shield, Globe2, Moon, RotateCcw, Save } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Orchestra AI" },
      { name: "description", content: "Workspace, security, regions and personalization preferences." },
    ],
  }),
  component: SettingsPage,
});

type FieldT = { l: string; t: boolean };
type FieldV = { l: string; v: string };
type Field = FieldT | FieldV;
type Section = { icon: typeof SettingsIcon; title: string; items: Field[] };

const DEFAULTS: Section[] = [
  { icon: SettingsIcon, title: "Workspace", items: [
    { l: "Organization name", v: "ORCHESTRA Demo" },
    { l: "Default environment", v: "Production" },
    { l: "Data retention", v: "90 days" },
  ]},
  { icon: Shield, title: "Security", items: [
    { l: "Enforce SSO (SAML)", t: true },
    { l: "Require MFA for admins", t: true },
    { l: "IP allowlist", v: "3 ranges" },
    { l: "Audit log export", t: true },
  ]},
  { icon: Bell, title: "Notifications", items: [
    { l: "Security alerts → email", t: true },
    { l: "Cost thresholds → Slack", t: true },
    { l: "Provider degradations → PagerDuty", t: false },
  ]},
  { icon: Globe2, title: "Regions & Residency", items: [
    { l: "Primary region", v: "us-east-1" },
    { l: "EU residency for EU traffic", t: true },
    { l: "Edge caching", t: true },
  ]},
  { icon: Moon, title: "Appearance", items: [
    { l: "Theme", v: "Dark · Mission Control" },
    { l: "Reduce motion", t: false },
    { l: "Compact density", t: false },
  ]},
];

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={() => onChange(!on)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${on ? "bg-[var(--neon-violet)]/60" : "bg-white/10"}`}>
      <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${on ? "translate-x-4" : "translate-x-0.5"}`} />
    </button>
  );
}

function SettingsPage() {
  const [sections, setSections] = useState<Section[]>(DEFAULTS);
  const [edit, setEdit] = useState<{ s: number; i: number } | null>(null);
  const [draft, setDraft] = useState("");
  const original = useRef(JSON.stringify(DEFAULTS));
  const dirty = JSON.stringify(sections) !== original.current;

  useEffect(() => {
    const saved = window.localStorage.getItem("orchestra.settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // re-attach icons (lost in JSON)
        const merged = DEFAULTS.map((d, i) => ({ ...d, items: parsed[i]?.items ?? d.items }));
        setSections(merged);
        original.current = JSON.stringify(merged);
      } catch { /* ignore */ }
    }
  }, []);

  const toggle = (s: number, i: number, v: boolean) => {
    setSections((prev) => prev.map((sec, si) => si !== s ? sec : {
      ...sec, items: sec.items.map((it, ii) => ii !== i ? it : { ...(it as FieldT), t: v }),
    }));
  };

  const save = () => {
    const serializable = sections.map((s) => ({ title: s.title, items: s.items }));
    window.localStorage.setItem("orchestra.settings", JSON.stringify(serializable));
    original.current = JSON.stringify(sections);
    toast.success("Settings saved");
  };
  const reset = () => {
    setSections(DEFAULTS);
    window.localStorage.removeItem("orchestra.settings");
    original.current = JSON.stringify(DEFAULTS);
    toast.message("Settings reset to defaults");
  };
  const openEdit = (s: number, i: number) => {
    const v = (sections[s].items[i] as FieldV).v;
    setDraft(v); setEdit({ s, i });
  };
  const saveEdit = () => {
    if (!edit) return;
    setSections((prev) => prev.map((sec, si) => si !== edit.s ? sec : {
      ...sec, items: sec.items.map((it, ii) => ii !== edit.i ? it : { ...(it as FieldV), v: draft }),
    }));
    setEdit(null);
  };

  return (
    <AppShell>
      <PageHero
        eyebrow="Control · Workspace"
        title="Settings"
        subtitle="Configure workspace-wide policies, security posture, regional residency and personal preferences."
        accent="var(--neon-cyan)"
        actions={
          <>
            <Btn variant="secondary" onClick={reset}><RotateCcw className="h-4 w-4" /> Reset</Btn>
            <Btn onClick={save} disabled={!dirty}><Save className="h-4 w-4" /> {dirty ? "Save changes" : "Saved"}</Btn>
          </>
        }
      />

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {sections.map((s, si) => {
          const Icon = s.icon;
          return (
            <Panel key={s.title}>
              <div className="mb-3 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-white/[0.04] text-[var(--neon-cyan)]">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="font-display text-lg font-semibold">{s.title}</div>
              </div>
              <div className="divide-y divide-white/5 rounded-lg border border-white/5">
                {s.items.map((it, ii) => (
                  <div key={it.l} className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm">
                    <span className="text-muted-foreground">{it.l}</span>
                    {"t" in it
                      ? <Toggle on={it.t} onChange={(v) => toggle(si, ii, v)} />
                      : <button onClick={() => openEdit(si, ii)}
                                className="rounded-md px-2 py-0.5 font-mono text-[12.5px] hover:bg-white/5">
                          {it.v}
                        </button>}
                  </div>
                ))}
              </div>
            </Panel>
          );
        })}
      </section>

      <Modal
        open={!!edit}
        onClose={() => setEdit(null)}
        title={edit ? `Edit · ${sections[edit.s].items[edit.i].l}` : ""}
        footer={
          <>
            <Btn variant="secondary" onClick={() => setEdit(null)}>Cancel</Btn>
            <Btn onClick={saveEdit}>Apply</Btn>
          </>
        }
      >
        <input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)}
               className="h-9 w-full rounded-md border border-white/10 bg-white/[0.03] px-3 text-sm focus:border-[var(--neon-violet)]/40 focus:outline-none focus:ring-1 focus:ring-[var(--neon-violet)]/30" />
      </Modal>
    </AppShell>
  );
}
