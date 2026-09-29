import type { User } from "./types";

// Requests go to /api on the same origin; next.config.ts proxies them to the Express server.
const BASE = "/api";

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: { path: string; message: string }[],
  ) {
    super(message);
  }
}

let refreshing: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  // De-duplicate concurrent refreshes.
  refreshing ??= fetch(`${BASE}/auth/refresh`, { method: "POST", credentials: "include" })
    .then(async (res) => {
      if (!res.ok) {
        accessToken = null;
        return false;
      }
      const data = (await res.json()) as { accessToken: string };
      accessToken = data.accessToken;
      return true;
    })
    .catch(() => false)
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

type Options = Omit<RequestInit, "body"> & { body?: unknown };

export async function api<T>(path: string, { body, headers, ...init }: Options = {}): Promise<T> {
  const doFetch = () =>
    fetch(`${BASE}${path}`, {
      ...init,
      credentials: "include",
      headers: {
        ...(body !== undefined && { "Content-Type": "application/json" }),
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

  let res = await doFetch();
  if (res.status === 401 && !path.startsWith("/auth/") && (await refreshAccessToken())) {
    res = await doFetch();
  }

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(res.status, data.message ?? "Request failed", data.details);
  }
  return data as T;
}

export function qs(params: Record<string, string | number | boolean | undefined | null>) {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") search.set(k, String(v));
  }
  const s = search.toString();
  return s ? `?${s}` : "";
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export function errorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    return err.details?.[0]?.message ?? err.message;
  }
  return "Something went wrong. Please try again.";
}
