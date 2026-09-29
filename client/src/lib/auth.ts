"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, setAccessToken, type AuthResponse } from "./api";
import type { User } from "./types";

const SESSION_KEY = ["session"] as const;

async function restoreSession(): Promise<User | null> {
  try {
    const data = await api<AuthResponse>("/auth/refresh", { method: "POST" });
    setAccessToken(data.accessToken);
    return data.user;
  } catch {
    setAccessToken(null);
    return null;
  }
}

export function useSession() {
  const { data, isPending } = useQuery({
    queryKey: SESSION_KEY,
    queryFn: restoreSession,
    staleTime: Infinity,
    retry: false,
  });
  return { user: data ?? null, isLoading: isPending, isAdmin: data?.role === "admin" };
}

export function useAuthActions() {
  const qc = useQueryClient();

  const onAuth = (data: AuthResponse) => {
    setAccessToken(data.accessToken);
    qc.setQueryData(SESSION_KEY, data.user);
  };

  const login = useMutation({
    mutationFn: (body: { email: string; password: string }) =>
      api<AuthResponse>("/auth/login", { method: "POST", body }),
    onSuccess: onAuth,
  });

  const register = useMutation({
    mutationFn: (body: { name: string; email: string; password: string }) =>
      api<AuthResponse>("/auth/register", { method: "POST", body }),
    onSuccess: onAuth,
  });

  const logout = useMutation({
    mutationFn: () => api<void>("/auth/logout", { method: "POST" }),
    onSettled: () => {
      setAccessToken(null);
      qc.setQueryData(SESSION_KEY, null);
      qc.removeQueries({ queryKey: ["orders"] });
      qc.removeQueries({ queryKey: ["admin"] });
    },
  });

  const updateProfile = useMutation({
    mutationFn: (body: { name?: string; currentPassword?: string; newPassword?: string }) =>
      api<{ user: User }>("/auth/me", { method: "PATCH", body }),
    onSuccess: (data) => qc.setQueryData(SESSION_KEY, data.user),
  });

  return { login, register, logout, updateProfile };
}
