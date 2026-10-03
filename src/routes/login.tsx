import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ApiError, bootstrapWorkspace, login, register } from "@/lib/api";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [workspace, setWorkspace] = useState("ORCHESTRA Workspace");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError("");
    try {
      if (mode === "login") await login(email, password);
      else { await register({ email, password, firstName, lastName }); await bootstrapWorkspace(workspace); }
      navigate({ to: "/" });
    } catch (err) { setError(err instanceof ApiError ? err.message : "Unable to authenticate"); }
    finally { setBusy(false); }
  }

  return <main className="min-h-screen grid place-items-center bg-background px-4">
    <form onSubmit={submit} className="glass-panel w-full max-w-md p-7 space-y-4">
      <div><div className="text-xs uppercase tracking-[.2em] text-muted-foreground">ORCHESTRA AI</div><h1 className="mt-2 text-2xl font-semibold">{mode === "login" ? "Sign in" : "Create workspace"}</h1><p className="mt-1 text-sm text-muted-foreground">Use the real gateway identity service.</p></div>
      {mode === "register" && <div className="grid grid-cols-2 gap-3"><input required value={firstName} onChange={e=>setFirstName(e.target.value)} placeholder="First name" className="h-10 rounded-md border border-white/10 bg-white/[.03] px-3 text-sm"/><input required value={lastName} onChange={e=>setLastName(e.target.value)} placeholder="Last name" className="h-10 rounded-md border border-white/10 bg-white/[.03] px-3 text-sm"/></div>}
      {mode === "register" && <input required value={workspace} onChange={e=>setWorkspace(e.target.value)} placeholder="Workspace name" className="h-10 w-full rounded-md border border-white/10 bg-white/[.03] px-3 text-sm"/>}
      <input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="h-10 w-full rounded-md border border-white/10 bg-white/[.03] px-3 text-sm"/>
      <input required minLength={8} type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" className="h-10 w-full rounded-md border border-white/10 bg-white/[.03] px-3 text-sm"/>
      {error && <div className="rounded-md border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}
      <Button disabled={busy} className="w-full">{busy ? "Working…" : mode === "login" ? "Sign in" : "Create workspace"}</Button>
      <button type="button" onClick={()=>setMode(mode === "login" ? "register" : "login")} className="w-full text-xs text-muted-foreground hover:text-foreground">{mode === "login" ? "Need an account? Create one" : "Already have an account? Sign in"}</button>
    </form>
  </main>;
}
