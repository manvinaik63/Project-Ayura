export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const TOKEN_KEY = "ayura_token";
const USER_KEY = "ayura_user";
const inBrowser = typeof window !== "undefined";   // pages also render on the server

export function getToken() {
  return inBrowser ? localStorage.getItem(TOKEN_KEY) : null;
}

export function getUser() {
  const raw = inBrowser ? localStorage.getItem(USER_KEY) : null;
  return raw ? JSON.parse(raw) : null;
}

export function setAuth(token: string, user: unknown) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// FastAPI sends errors as {"detail": "text"} or, for invalid input, {"detail": [{msg: ...}]}
function errorMessage(data: any, status: number) {
  if (typeof data?.detail === "string") return data.detail;
  if (Array.isArray(data?.detail)) return data.detail.map((d: any) => d.msg).join(", ");
  return `Request failed (${status})`;
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers = new Headers(options.headers);
  const isJson = options.body && !(options.body instanceof FormData) && !(options.body instanceof URLSearchParams);
  if (isJson) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  } catch {
    throw new Error("Could not reach the AYURA server. Is the backend running?");
  }
  if (response.status === 401 && token) {          // login expired or secret key changed
    clearAuth();
    window.location.href = "/login";
  }
  if (response.status === 204) return null;         // e.g. after a delete
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(errorMessage(data, response.status));
  return data;
}

export async function login(email: string, password: string) {
  clearAuth();                                        // drop any old login first
  const form = new URLSearchParams({ username: email, password });   // the backend expects form fields
  const { access_token } = await apiFetch("/auth/login", { method: "POST", body: form });
  localStorage.setItem(TOKEN_KEY, access_token);
  const user = await apiFetch("/auth/me");
  setAuth(access_token, user);
  return user;
}

export async function register(details: Record<string, unknown> & { email: string; password: string }) {
  await apiFetch("/auth/register", { method: "POST", body: JSON.stringify(details) });
  return login(details.email, details.password);     // register returns no token, so log in straight after
}