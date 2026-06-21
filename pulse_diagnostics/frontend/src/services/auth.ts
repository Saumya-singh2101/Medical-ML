const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
const TOKEN_KEY = 'pulse_token';
const USER_KEY = 'pulse_user';

export interface AuthUser {
  id: number;
  username: string;
  email?: string | null;
}

function saveSession(token: string, user: AuthUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function handleAuthResponse(res: Response): Promise<AuthUser> {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong.');
  }
  saveSession(data.token, data.user);
  return data.user;
}

export async function login(username: string, password: string): Promise<AuthUser> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return handleAuthResponse(res);
}

export async function register(
  username: string,
  password: string,
  email?: string
): Promise<AuthUser> {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, email }),
  });
  return handleAuthResponse(res);
}

export async function verifySession(): Promise<AuthUser | null> {
  const token = getToken();
  const cachedUser = localStorage.getItem(USER_KEY);
  if (!token || !cachedUser) return null;

  try {
    const res = await fetch(`${API_BASE}/api/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      logout();
      return null;
    }
    return JSON.parse(cachedUser);
  } catch {
    // Backend unreachable — fall back to cached session optimistically.
    return JSON.parse(cachedUser);
  }
}
