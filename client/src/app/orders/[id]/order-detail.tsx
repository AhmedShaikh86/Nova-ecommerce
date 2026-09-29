"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AuthGuard } from "@/components/auth-guard";
import { OrderStatusBadge } from "@/components/order-status";
import { OrderSummary } from "@/components/order-summary";
import { ProductVisual } from "@/components/product-visual";
import { EmptyState, FormError, PageLoader } from "@/components/states";
import { api, errorMessage } from "@/lib/api";
import { formatDate, formatPrice, shortId } from "@/lib/format";
import type { Order, OrderStatus } from "@/lib/types";

const STEPS: OrderStatus[] = ["pending", "processing", "shipped", "delivered"];

export function OrderDetail({ id }: { id: string }) {
  return (
    <AuthGuard>
      <OrderView id={id} />
    </AuthGuard>
  );
}

function OrderView({ id }: { id: string }) {
  const placed = useSearchParams().get("placed") === "1";
  const qc = useQueryClient();
  const { data, isPending, isError } = useQuery({
    queryKey: ["orders", id],
    queryFn: () => api<{ order: Order }>(`/orders/${id}`),
  });

  const cancel = useMutation({
    mutationFn: () => api<{ order: Order }>(`/orders/${id}/cancel`, { method: "POST" }),
    onSuccess: (res) => {
      qc.setQueryData(["orders", id], res);
      qc.invalidateQueries({ queryKey: ["orders", "mine"] });
    },
  });

  if (isPending) return <PageLoader />;
  if (isError) {
    return (
      <div className="container-page py-16">
        <EmptyState title="Order not found" action={{ href: "/account", label: "Back to account" }} />
      </div>
    );
  }

  const { order } = data;
  const stepIndex = STEPS.indexOf(order.status);

  return (
    <div className="container-page py-10">
      {placed && (
        <div className="mb-8 rounded-2xl border border-success/30 bg-success/10 p-6">
          <p className="text-lg font-semibold text-success">Thank you! Your order has been placed.</p>
          <p className="mt-1 text-sm text-muted">
            We&apos;ll let you know when it ships. You can track it from your account at any time.
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/account#orders" className="text-sm text-muted hover:text-foreground">
            ← All orders
          </Link>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Order {shortId(order._id)}</h1>
          <p className="mt-1 text-sm text-muted">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {order.status !== "cancelled" && (
        <ol className="mt-8 grid grid-cols-4 gap-2">
          {STEPS.map((s, i) => (
            <li key={s} className="flex flex-col gap-2">
              <div className={`h-1.5 rounded-full ${i <= stepIndex ? "bg-accent" : "bg-surface-muted"}`} />
              <span className={`text-xs capitalize ${i <= stepIndex ? "font-medium" : "text-muted"}`}>{s}</span>
            </li>
          ))}
        </ol>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <ul className="card divide-y divide-border">
            {order.items.map((item) => (
              <li key={item.product} className="flex items-center gap-4 p-4">
                <ProductVisual
                  category={item.category}
                  image={item.image}
                  name={item.name}
                  className="h-16 w-16 shrink-0 rounded-xl"
                  iconSize={24}
                />
                <div className="flex-1">
                  <Link href={`/products/${item.slug}`} className="font-medium hover:text-accent">
                    {item.name}
                  </Link>
                  <p className="text-sm text-muted">
                    {item.quantity} × {formatPrice(item.price)}
                  </p>
                </div>
                <span className="font-semibold">{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="card p-5 text-sm">
              <h2 className="font-semibold">Shipping to</h2>
              <address className="mt-2 not-italic leading-relaxed text-muted">
                {order.shippingAddress.fullName}
                <br />
                {order.shippingAddress.address}
                <br />
                {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                <br />
                {order.shippingAddress.country}
                <br />
                {order.shippingAddress.phone}
              </address>
            </div>
            <div className="card p-5 text-sm">
              <h2 className="font-semibold">Payment</h2>
              <p className="mt-2 text-muted">
                {order.paymentMethod === "cod" ? "Cash on delivery" : "Card (demo)"}
              </p>
              <p className={`mt-1 font-medium ${order.isPaid ? "text-success" : "text-warning"}`}>
                {order.isPaid ? `Paid on ${formatDate(order.paidAt!)}` : "Not paid yet"}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <OrderSummary {...order}>
            {order.status === "pending" && (
              <div className="mt-5 space-y-3">
                <FormError message={cancel.isError ? errorMessage(cancel.error) : null} />
                <button
                  type="button"
                  className="btn btn-outline w-full text-danger"
                  disabled={cancel.isPending}
                  onClick={() => {
                    if (confirm("Cancel this order?")) cancel.mutate();
                  }}
                >
                  {cancel.isPending ? "Cancelling…" : "Cancel order"}
                </button>
              </div>
            )}
          </OrderSummary>
        </div>
      </div>
    </div>
  );
}
