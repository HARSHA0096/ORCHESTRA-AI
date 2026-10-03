const baseUrl = ((import.meta.env.VITE_BACKEND_URL as string | undefined) || "http://localhost:3001").replace(/\/$/, "");

const ACCESS_KEY = "orchestra.accessToken";
const REFRESH_KEY = "orchestra.refreshToken";
const PROJECT_KEY = "orchestra.projectId";
const ORG_KEY = "orchestra.organizationId";

export type ApiEnvelope<T> = { success: boolean; data: T; message?: string; meta?: Record<string, unknown>; requestId?: string; timestamp?: string };

export class ApiError extends Error {
  constructor(public status: number, message: string, public requestId?: string) { super(message); this.name = "ApiError"; }
}

export const session = {
  get accessToken() { return typeof window === "undefined" ? null : localStorage.getItem(ACCESS_KEY); },
  get refreshToken() { return typeof window === "undefined" ? null : localStorage.getItem(REFRESH_KEY); },
  get projectId() { return typeof window === "undefined" ? null : localStorage.getItem(PROJECT_KEY); },
  get organizationId() { return typeof window === "undefined" ? null : localStorage.getItem(ORG_KEY); },
  setTokens(access: string, refresh: string) { localStorage.setItem(ACCESS_KEY, access); localStorage.setItem(REFRESH_KEY, refresh); },
  setProject(id: string, organizationId?: string) { localStorage.setItem(PROJECT_KEY, id); if (organizationId) localStorage.setItem(ORG_KEY, organizationId); window.dispatchEvent(new Event("orchestra-session")); },
  clear() { localStorage.removeItem(ACCESS_KEY); localStorage.removeItem(REFRESH_KEY); localStorage.removeItem(PROJECT_KEY); localStorage.removeItem(ORG_KEY); window.dispatchEvent(new Event("orchestra-session")); },
};

async function request<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  const token = session.accessToken;
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const projectId = session.projectId;
  if (projectId) headers.set("X-Project-ID", projectId);

  const response = await fetch(`${baseUrl}${path}`, { ...init, headers });
  const payload = await response.json().catch(() => ({})) as ApiEnvelope<T> & { error?: { message?: string }; message?: string };
  if (response.status === 401 && retry && session.refreshToken) {
    const refreshed = await refreshSession();
    if (refreshed) return request<T>(path, init, false);
  }
  if (!response.ok) throw new ApiError(response.status, payload.message ?? payload.error?.message ?? `Request failed (${response.status})`, payload.requestId);
  return (payload && "data" in payload ? payload.data : payload) as T;
}

export async function refreshSession() {
  const refreshToken = session.refreshToken;
  if (!refreshToken) return false;
  const response = await fetch(`${baseUrl}/api/v1/auth/refresh`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ refreshToken }) });
  if (!response.ok) { session.clear(); return false; }
  const payload = await response.json() as ApiEnvelope<{ accessToken: string; refreshToken: string }>;
  session.setTokens(payload.data.accessToken, payload.data.refreshToken);
  return true;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) => request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) => request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
};

export async function login(email: string, password: string) {
  const data = await api.post<{ user: { id: string; email: string }; tokens: { accessToken: string; refreshToken: string } }>("/api/v1/auth/login", { email, password });
  session.setTokens(data.tokens.accessToken, data.tokens.refreshToken);
  return data.user;
}

export async function register(input: { email: string; password: string; firstName: string; lastName: string }) {
  const data = await api.post<{ user: { id: string; email: string }; tokens: { accessToken: string; refreshToken: string } }>("/api/v1/auth/register", input);
  session.setTokens(data.tokens.accessToken, data.tokens.refreshToken);
  return data.user;
}

export async function bootstrapWorkspace(name: string) {
  const org = await api.post<{ id: string }>("/api/v1/organizations", { name });
  const project = await api.post<{ id: string; organizationId: string }>(`/api/v1/organizations/${org.id}/projects`, { name: `${name} Project` });
  session.setProject(project.id, org.id);
  return project;
}

export async function ensureProject() {
  if (session.projectId) return session.projectId;
  const orgs = await api.get<Array<{ id: string; name: string }>>("/api/v1/organizations");
  if (orgs[0]) {
    const projects = await api.get<Array<{ id: string; organizationId: string }>>(`/api/v1/organizations/${orgs[0].id}/projects`);
    if (projects[0]) { session.setProject(projects[0].id, orgs[0].id); return projects[0].id; }
  }
  return null;
}
