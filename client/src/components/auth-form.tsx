"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { FormEvent } from "react";
import { errorMessage } from "@/lib/api";
import { useAuthActions } from "@/lib/auth";
import { FormError } from "./states";

// Only allow same-site relative redirects.
function safeNext(value: string | null) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/";
}

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const { login, register } = useAuthActions();
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const mutation = mode === "login" ? login : register;

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email"));
    const password = String(fd.get("password"));
    const onSuccess = () => router.replace(next);
    if (mode === "login") login.mutate({ email, password }, { onSuccess });
    else register.mutate({ name: String(fd.get("name")), email, password }, { onSuccess });
  };

  const isLogin = mode === "login";
  const otherHref = `${isLogin ? "/register" : "/login"}${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`;

  return (
    <div className="container-page flex justify-center py-16">
      <div className="card w-full max-w-md p-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          {isLogin ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {isLogin ? "Sign in to your NOVA account." : "Join NOVA for faster checkout and order tracking."}
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          {!isLogin && (
            <div>
              <label htmlFor="name" className="label">
                Name
              </label>
              <input id="name" name="name" autoComplete="name" required minLength={2} className="input" />
            </div>
          )}
          <div>
            <label htmlFor="email" className="label">
              Email
            </label>
            <input id="email" name="email" type="email" autoComplete="email" required className="input" />
          </div>
          <div>
            <label htmlFor="password" className="label">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              required
              minLength={isLogin ? 1 : 8}
              className="input"
            />
            {!isLogin && <p className="mt-1.5 text-xs text-muted">At least 8 characters.</p>}
          </div>

          <FormError message={mutation.isError ? errorMessage(mutation.error) : null} />

          <button type="submit" className="btn btn-primary w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Please wait…" : isLogin ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          {isLogin ? "New to NOVA? " : "Already have an account? "}
          <Link href={otherHref} className="font-medium text-accent hover:underline">
            {isLogin ? "Create an account" : "Sign in"}
          </Link>
        </p>

        {isLogin && (
          <div className="mt-6 rounded-xl bg-surface-muted p-4 text-xs text-muted">
            <p className="font-medium text-foreground">Demo accounts</p>
            <p className="mt-1">Customer: customer@nova.dev / Customer@123</p>
            <p>Admin: admin@nova.dev / Admin@12345</p>
          </div>
        )}
      </div>
    </div>
  );
}
