export const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

export function getToken() {
  return localStorage.getItem("ayura_token");
}

export function getUser() {
  const raw = localStorage.getItem("ayura_user");
  return raw ? JSON.parse(raw) : null;
}

export function setAuth(token: string, user: unknown) {
  localStorage.setItem("ayura_token", token);
  localStorage.setItem("ayura_user", JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem("ayura_token");
  localStorage.removeItem("ayura_user");
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof FormData)) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const url = `${API_BASE}${path}`;
  let response: Response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch {
    throw new Error("Could not reach the AYURA server. Is the backend running?");
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}

export function requireToken() {
  const token = getToken();
  if (!token) throw new Error("Please sign in first.");
  return token;
}
