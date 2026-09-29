import Link from "next/link";
import type { ReactNode } from "react";

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <div
      className={`h-6 w-6 animate-spin rounded-full border-2 border-border border-t-accent ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}

export function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Spinner />
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="card flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <h2 className="text-lg font-semibold">{title}</h2>
      {description && <p className="max-w-sm text-sm text-muted">{description}</p>}
      {action && (
        <Link href={action.href} className="btn btn-primary mt-2">
          {action.label}
        </Link>
      )}
    </div>
  );
}

export function ErrorState({ message, children }: { message: string; children?: ReactNode }) {
  return (
    <div className="card border-danger/30 px-6 py-10 text-center">
      <p className="font-medium text-danger">{message}</p>
      {children}
    </div>
  );
}

export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <p className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger" role="alert">
      {message}
    </p>
  );
}
