"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useSession } from "@/lib/auth";
import { PageLoader } from "./states";

/** Renders children only for signed-in users (optionally admins only). */
export function AuthGuard({ children, admin = false }: { children: ReactNode; admin?: boolean }) {
  const { user, isLoading } = useSession();
  const pathname = usePathname();

  if (isLoading) return <PageLoader />;

  if (!user) {
    return (
      <div className="container-page flex min-h-[50vh] flex-col items-center justify-center gap-4 py-16 text-center">
        <h1 className="text-2xl font-semibold">Sign in required</h1>
        <p className="text-muted">Please sign in to continue.</p>
        <Link href={`/login?next=${encodeURIComponent(pathname)}`} className="btn btn-primary">
          Sign in
        </Link>
      </div>
    );
  }

  if (admin && user.role !== "admin") {
    return (
      <div className="container-page flex min-h-[50vh] flex-col items-center justify-center gap-4 py-16 text-center">
        <h1 className="text-2xl font-semibold">Access denied</h1>
        <p className="text-muted">You need an admin account to view this page.</p>
        <Link href="/" className="btn btn-outline">
          Back to store
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
