import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ApiError, bootstrapWorkspace, register } from "@/lib/api";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/register")({ component: RegisterPage });

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", workspace: "ORCHESTRA Workspace" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try { await register({ firstName: form.firstName, lastName: form.lastName, email: form.email, password: form.password }); await bootstrapWorkspace(form.workspace.trim() || "ORCHESTRA Workspace"); await navigate({ to: "/" }); }
    catch (err) { setError(err instanceof ApiError ? err.message : "Unable to reach the account service. Check the gateway connection and try again."); }
    finally { setBusy(false); }
  }
  const input = "h-10 w-full rounded-md border border-white/10 bg-white/[.03] px-3 text-sm";
  return <main className="min-h-screen grid place-items-center bg-background px-4"><form onSubmit={submit} className="glass-panel w-full max-w-md space-y-4 p-7">
    <div><div className="text-xs uppercase tracking-[.2em] text-muted-foreground">ORCHESTRA AI</div><h1 className="mt-2 text-2xl font-semibold">Create account</h1><p className="mt-1 text-sm text-muted-foreground">Register with the gateway identity service.</p></div>
    <div className="grid grid-cols-2 gap-3"><input className={input} autoComplete="given-name" required maxLength={100} placeholder="First name" value={form.firstName} onChange={(e) => update("firstName", e.target.value)} /><input className={input} autoComplete="family-name" required maxLength={100} placeholder="Last name" value={form.lastName} onChange={(e) => update("lastName", e.target.value)} /></div>
    <input className={input} type="text" required maxLength={64} placeholder="Workspace name" value={form.workspace} onChange={(e) => update("workspace", e.target.value)} />
    <input className={input} type="email" autoComplete="email" required placeholder="Email" value={form.email} onChange={(e) => update("email", e.target.value)} />
    <input className={input} type="password" autoComplete="new-password" required minLength={8} maxLength={128} placeholder="Password (8+ characters)" value={form.password} onChange={(e) => update("password", e.target.value)} />
    {error && <div role="alert" className="rounded-md border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}
    <Button disabled={busy} className="w-full">{busy ? "Creating account…" : "Create account"}</Button>
    <Link to="/login" className="block text-center text-xs text-muted-foreground hover:text-foreground">Already have an account? Sign in</Link>
  </form></main>;
}
