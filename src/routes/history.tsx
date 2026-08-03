import { createFileRoute } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { AppShell, PageHero, Panel, StatCard, Modal, Btn } from "@/components/app-shell";
import { History as HistoryIcon, CheckCircle2, AlertTriangle, RefreshCw, Search, X, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const searchSchema = z.object({
  q: fallback(z.string(), "").default(""),
  status: fallback(z.enum(["all", "completed", "blocked", "recovered", "routed"]), "all").default("all"),
  page: fallback(z.number().int().min(1), 1).default(1),
});

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Request History — Orchestra AI" },
      { name: "description", content: "Searchable archive of every AI request, response, route decision and policy outcome." },
    ],
  }),
  validateSearch: zodValidator(searchSchema),
  component: HistoryPage,
});

type Row = {
  id: string; model: string; tokens: number; latency: number;
  cost: string; status: "completed" | "blocked" | "recovered" | "routed"; ts: string;
};

const ROWS: Row[] = Array.from({ length: 64 }, (_, i) => {
  const models = ["gpt-4o", "claude-3.5", "gemini-1.5", "deepseek-v2", "mistral-l"];
  const statuses: Row["status"][] = ["completed", "completed", "completed", "blocked", "recovered", "routed"];
  return {
    id: `req_${(0x8a3f9c00 + i).toString(16)}`,
    model: models[i % models.length],
    tokens: 200 + Math.round(Math.random() * 4800),
    latency: 180 + Math.round(Math.random() * 800),
    cost: (Math.random() * 0.08).toFixed(4),
    status: statuses[i % statuses.length],
    ts: `14:${String(4 - Math.floor(i / 16)).padStart(2,"0")}:${String((59 - i * 3) % 60).padStart(2,"0")}`,
  };
});

const statusStyle = (s: string) => ({
  completed: "bg-[oklch(0.85_0.21_155/0.12)] text-[var(--neon-green)]",
  blocked:   "bg-[oklch(0.7_0.25_25/0.18)] text-[var(--neon-red)]",
  recovered: "bg-[oklch(0.7_0.24_295/0.18)] text-[var(--neon-violet)]",
  routed:    "bg-[oklch(0.84_0.16_210/0.16)] text-[var(--neon-cyan)]",
}[s] ?? "");

const PAGE_SIZE = 12;

function HistoryPage() {
  const { q, status, page } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [details, setDetails] = useState<Row | null>(null);

  const filtered = useMemo(() => ROWS.filter((r) =>
    (status === "all" || r.status === status) &&
    (q === "" || r.id.includes(q.toLowerCase()) || r.model.includes(q.toLowerCase()))
  ), [q, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const setSearch = (patch: Partial<{ q: string; status: string; page: number }>) =>
    navigate({ search: (prev: { q: string; status: string; page: number }) => ({ ...prev, ...patch, page: patch.page ?? 1 }) as never });

  const exportCsv = () => {
    const rows = [["id","model","tokens","latency","cost","status","time"], ...filtered.map((r) => [r.id, r.model, r.tokens, r.latency, r.cost, r.status, r.ts])];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "orchestra-history.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported CSV", { description: `${filtered.length} rows` });
  };

  return (
    <AppShell>
      <PageHero
        eyebrow="Archive · Searchable"
        title="Request History"
        subtitle="Every prompt, response, route decision and policy verdict — retained, searchable, exportable for audit and replay."
        accent="var(--neon-cyan)"
        actions={<Btn variant="secondary" onClick={exportCsv}><Download className="h-4 w-4" /> Export CSV</Btn>}
      />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Records (24h)" value={ROWS.length.toLocaleString()} delta="+8%" color="var(--neon-cyan)" icon={HistoryIcon} />
        <StatCard label="Completed"     value="98.6%" color="var(--neon-green)" icon={CheckCircle2} />
        <StatCard label="Blocked"       value={String(ROWS.filter((r) => r.status === "blocked").length)} delta="+12" color="var(--neon-red)" icon={AlertTriangle} />
        <StatCard label="Recovered"     value={String(ROWS.filter((r) => r.status === "recovered").length)} delta="+18" color="var(--neon-violet)" icon={RefreshCw} />
      </section>

      <Panel
        eyebrow="Log"
        title="Recent Requests"
        actions={
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input value={q} onChange={(e) => setSearch({ q: e.target.value })}
                     placeholder="Search id or model…"
                     className="h-8 w-56 rounded-md border border-white/10 bg-white/[0.03] pl-8 pr-7 text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-[var(--neon-violet)]/30" />
              {q && <button onClick={() => setSearch({ q: "" })} aria-label="Clear" className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="h-3 w-3" /></button>}
            </div>
            <select value={status} onChange={(e) => setSearch({ status: e.target.value })}
                    className="h-8 rounded-md border border-white/10 bg-white/[0.03] px-2 text-xs focus:outline-none">
              <option value="all">All statuses</option>
              <option value="completed">Completed</option>
              <option value="blocked">Blocked</option>
              <option value="recovered">Recovered</option>
              <option value="routed">Routed</option>
            </select>
          </div>
        }
      >
        {pageRows.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/10 px-4 py-12 text-center">
            <HistoryIcon className="mx-auto h-8 w-8 text-muted-foreground/60" />
            <div className="mt-3 font-display text-sm font-medium">No requests match your filters</div>
            <Btn variant="secondary" className="mt-4" onClick={() => navigate({ search: { q: "", status: "all", page: 1 } as never })}>Reset filters</Btn>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white/[0.03] text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left">ID</th>
                    <th className="px-3 py-2 text-left">Model</th>
                    <th className="px-3 py-2 text-right">Tokens</th>
                    <th className="px-3 py-2 text-right">Latency</th>
                    <th className="px-3 py-2 text-right">Cost</th>
                    <th className="px-3 py-2 text-right">Status</th>
                    <th className="px-3 py-2 text-right">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((r) => (
                    <tr key={r.id} onClick={() => setDetails(r)}
                        className="cursor-pointer border-t border-white/5 transition-colors hover:bg-white/[0.03]">
                      <td className="px-3 py-2 font-mono text-[12px] text-[var(--neon-cyan)]">{r.id}</td>
                      <td className="px-3 py-2 font-mono text-[12px]">{r.model}</td>
                      <td className="px-3 py-2 text-right font-mono">{r.tokens.toLocaleString()}</td>
                      <td className="px-3 py-2 text-right font-mono">{r.latency}ms</td>
                      <td className="px-3 py-2 text-right font-mono text-[var(--neon-green)]">${r.cost}</td>
                      <td className="px-3 py-2 text-right">
                        <span className={`rounded-md px-1.5 py-0.5 text-[11px] ${statusStyle(r.status)}`}>{r.status}</span>
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-muted-foreground">{r.ts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <div>Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}</div>
              <div className="flex items-center gap-1">
                <button onClick={() => setSearch({ page: Math.max(1, safePage - 1) })} disabled={safePage === 1}
                        className="grid h-7 w-7 place-items-center rounded-md border border-white/10 hover:bg-white/5 disabled:opacity-40">
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <span className="px-2 font-mono">{safePage} / {totalPages}</span>
                <button onClick={() => setSearch({ page: Math.min(totalPages, safePage + 1) })} disabled={safePage === totalPages}
                        className="grid h-7 w-7 place-items-center rounded-md border border-white/10 hover:bg-white/5 disabled:opacity-40">
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </>
        )}
      </Panel>

      <Modal
        open={!!details}
        onClose={() => setDetails(null)}
        title={details ? `Request ${details.id}` : ""}
        description="Full trace and metadata for this request."
        size="lg"
        footer={<Btn variant="secondary" onClick={() => setDetails(null)}>Close</Btn>}
      >
        {details && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                ["Model", details.model],
                ["Tokens", details.tokens.toLocaleString()],
                ["Latency", `${details.latency}ms`],
                ["Cost", `$${details.cost}`],
              ].map(([l, v]) => (
                <div key={l} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{l}</div>
                  <div className="mt-1 font-mono">{v}</div>
                </div>
              ))}
            </div>
            <div>
              <div className="mb-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">Status</div>
              <span className={`rounded-md px-2 py-1 text-xs ${statusStyle(details.status)}`}>{details.status}</span>
            </div>
            <div>
              <div className="mb-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">Trace</div>
              <pre className="overflow-x-auto rounded-lg border border-white/10 bg-black/40 p-3 font-mono text-[12px] leading-relaxed text-muted-foreground">
{`→ gateway.ingress         · 4ms
→ router.select(${details.model}) · 12ms
→ provider.dispatch       · ${details.latency - 40}ms
→ security.scan           · 8ms
→ response.normalize      · 16ms
✓ ${details.status}                  · total ${details.latency}ms`}
              </pre>
            </div>
          </div>
        )}
      </Modal>
    </AppShell>
  );
}
