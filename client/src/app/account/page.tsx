"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import type { FormEvent } from "react";
import { AuthGuard } from "@/components/auth-guard";
import { OrderStatusBadge } from "@/components/order-status";
import { EmptyState, ErrorState, FormError, Spinner } from "@/components/states";
import { useToast } from "@/components/toast";
import { api, errorMessage } from "@/lib/api";
import { useAuthActions, useSession } from "@/lib/auth";
import { formatDate, formatPrice, shortId } from "@/lib/format";
import type { Order } from "@/lib/types";

export default function AccountPage() {
  return (
    <AuthGuard>
      <Account />
    </AuthGuard>
  );
}

function Account() {
  const { user } = useSession();

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-semibold tracking-tight">My account</h1>
      <p className="mt-1 text-sm text-muted">
        Signed in as {user!.email} · Member since {formatDate(user!.createdAt)}
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <section id="orders" className="scroll-mt-24">
          <h2 className="text-lg font-semibold">Order history</h2>
          <div className="mt-4">
            <OrderList />
          </div>
        </section>
        <aside>
          <ProfileForm />
        </aside>
      </div>
    </div>
  );
}

function OrderList() {
  const { data, isPending, isError } = useQuery({
    queryKey: ["orders", "mine"],
    queryFn: () => api<{ orders: Order[] }>("/orders/mine"),
  });

  if (isPending) return <Spinner />;
  if (isError) return <ErrorState message="Couldn't load your orders." />;
  if (data.orders.length === 0) {
    return (
      <EmptyState
        title="No orders yet"
        description="When you place an order, it will show up here."
        action={{ href: "/products", label: "Start shopping" }}
      />
    );
  }

  return (
    <ul className="space-y-3">
      {data.orders.map((o) => (
        <li key={o._id}>
          <Link
            href={`/orders/${o._id}`}
            className="card flex flex-wrap items-center justify-between gap-4 p-5 transition hover:border-accent/50"
          >
            <div>
              <p className="font-medium">Order {shortId(o._id)}</p>
              <p className="text-sm text-muted">
                {formatDate(o.createdAt)} · {o.items.reduce((n, i) => n + i.quantity, 0)} items
              </p>
            </div>
            <div className="flex items-center gap-4">
              <OrderStatusBadge status={o.status} />
              <span className="font-semibold">{formatPrice(o.totalPrice)}</span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function ProfileForm() {
  const { user } = useSession();
  const { updateProfile } = useAuthActions();
  const toast = useToast();

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const newPassword = String(fd.get("newPassword") ?? "");
    updateProfile.mutate(
      {
        name: String(fd.get("name")),
        ...(newPassword && {
          newPassword,
          currentPassword: String(fd.get("currentPassword") ?? ""),
        }),
      },
      {
        onSuccess: () => {
          toast("Profile updated");
          (form.elements.namedItem("currentPassword") as HTMLInputElement).value = "";
          (form.elements.namedItem("newPassword") as HTMLInputElement).value = "";
        },
      },
    );
  };

  return (
    <form onSubmit={onSubmit} className="card space-y-4 p-6">
      <h2 className="font-semibold">Profile</h2>
      <div>
        <label htmlFor="name" className="label">
          Name
        </label>
        <input id="name" name="name" defaultValue={user!.name} required minLength={2} className="input" />
      </div>
      <div>
        <label htmlFor="currentPassword" className="label">
          Current password
        </label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          className="input"
        />
      </div>
      <div>
        <label htmlFor="newPassword" className="label">
          New password
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          placeholder="Leave blank to keep current"
          className="input"
        />
      </div>
      <FormError message={updateProfile.isError ? errorMessage(updateProfile.error) : null} />
      <button type="submit" className="btn btn-primary w-full" disabled={updateProfile.isPending}>
        {updateProfile.isPending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
