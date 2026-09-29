"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">Something went wrong</h1>
      <p className="max-w-sm text-muted">An unexpected error occurred. Please try again.</p>
      <button type="button" onClick={reset} className="btn btn-primary mt-2">
        Try again
      </button>
    </div>
  );
}
