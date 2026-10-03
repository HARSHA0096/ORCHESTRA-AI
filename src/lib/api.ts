export const API_BASE_URL = ((import.meta.env.VITE_API_URL as string | undefined) || (import.meta.env.VITE_BACKEND_URL as string | undefined) || (import.meta.env.DEV ? "http://localhost:3001" : "")).replace(/\/+$/, "");

const ACCESS_KEY = "orchestra.accessToken";
const REFRESH_KEY = "orchestra.refreshToken";
const PROJECT_KEY = "orchestra.projectId";
const ORG_KEY = "orchestra.organizationId";

export type ApiEnvelope<T> = { success: boolean; data: T; message?: string; meta?: Record<string, unknown>; requestId?: string; timestamp?: string };

export class ApiError extends Error {
  constructor(public status: number, message: string, public requestId?: string) { super(message); this.name = "ApiError"; }
}

export function getApiBaseUrl() { return API_BASE_URL; }

export const session = {
  get accessToken() { return typeof window === "undefined" ? null : localStorage.getItem(ACCESS_KEY); },
  get refreshToken() { return typeof window === "undefined" ? null : localStorage.getItem(REFRESH_KEY); },
  get projectId() { return typeof window === "undefined" ? null : localStorage.getItem(PROJECT_KEY); },
  get organizationId() { return typeof window === "undefined" ? null : localStorage.getItem(ORG_KEY); },
  setTokens(access: string, refresh: string) { localStorage.setItem(ACCESS_KEY, access); localStorage.setItem(REFRESH_KEY, refresh); window.dispatchEvent(new Event("orchestra-session")); },
  setProject(id: string, organizationId?: string) { localStorage.setItem(PROJECT_KEY, id); if (organizationId) localStorage.setItem(ORG_KEY, organizationId); window.dispatchEvent(new Event("orchestra-session")); },
  clear() { if (typeof window === "undefined") return; localStorage.removeItem(ACCESS_KEY); localStorage.removeItem(REFRESH_KEY); localStorage.removeItem(PROJECT_KEY); localStorage.removeItem(ORG_KEY); window.dispatchEvent(new Event("orchestra-session")); },
};

async function request<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  const token = session.accessToken;
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const projectId = session.projectId;
  if (projectId) headers.set("X-Project-ID", projectId);

  if (!API_BASE_URL) throw new ApiError(0, "API connection is not configured. Set VITE_API_URL for this deployment.");
  let response: Response;
  try { response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers }); }
  catch { throw new ApiError(0, "Unable to connect to the ORCHESTRA gateway. Check the API URL and network connection."); }
  const payload = await response.json().catch(() => ({})) as ApiEnvelope<T> & { error?: { message?: string }; message?: string };
  if (response.status === 401 && retry) {
    if (session.refreshToken) {
      const refreshed = await refreshSession();
      if (refreshed) return request<T>(path, init, false);
    }
    session.clear();
  }
  if (response.status === 401 && !retry) session.clear();
  if (!response.ok) throw new ApiError(response.status, payload.message ?? payload.error?.message ?? `Request failed (${response.status})`, payload.requestId);
  return (payload && "data" in payload ? payload.data : payload) as T;
}

export async function refreshSession() {
  const refreshToken = session.refreshToken;
  if (!refreshToken) return false;
  if (!API_BASE_URL) return false;
  let response: Response;
  try { response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ refreshToken }) }); }
  catch { session.clear(); return false; }
  if (!response.ok) { session.clear(); return false; }
  const payload = await response.json() as ApiEnvelope<{ accessToken: string; refreshToken: string }>;
  session.setTokens(payload.data.accessToken, payload.data.refreshToken);
  return true;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) => request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) => request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

export async function logout() {
  try { if (session.accessToken) await api.post("/api/v1/auth/logout", {}); }
  finally { session.clear(); }
}

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
