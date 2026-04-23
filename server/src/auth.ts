// Simple client-side auth helpers. Stores the JWT and user profile in
// localStorage, and provides an authFetch() wrapper that attaches the token
// to every request and handles 401 responses by logging the user out.

export type AuthUser = {
  id: number;
  username: string;
  name: string;
  email: string;
};

const TOKEN_KEY = "keepup_token";
const USER_KEY = "keepup_user";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

export function saveAuth(token: string, user: AuthUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

/**
 * authFetch(path, options)
 *
 * Like fetch(), but:
 *  - prepends the backend API base URL
 *  - adds the Authorization: Bearer <token> header automatically
 *  - if the response is 401, clears auth and redirects to /login
 */
export async function authFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers = new Headers(options.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    clearAuth();
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  }
  return res;
}