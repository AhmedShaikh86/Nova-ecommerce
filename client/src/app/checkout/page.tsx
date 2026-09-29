"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AuthGuard } from "@/components/auth-guard";
import { OrderSummary } from "@/components/order-summary";
import { EmptyState, FormError, PageLoader } from "@/components/states";
import { api, errorMessage } from "@/lib/api";
import { useSession } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { calculateTotals } from "@/lib/pricing";
import type { Order, ShippingAddress } from "@/lib/types";

export default function CheckoutPage() {
  return (
    <AuthGuard>
      <Checkout />
    </AuthGuard>
  );
}

const FIELDS: { name: keyof ShippingAddress; label: string; autoComplete: string; span?: boolean }[] = [
  { name: "fullName", label: "Full name", autoComplete: "name", span: true },
  { name: "phone", label: "Phone", autoComplete: "tel", span: true },
  { name: "address", label: "Street address", autoComplete: "street-address", span: true },
  { name: "city", label: "City", autoComplete: "address-level2" },
  { name: "postalCode", label: "Postal code", autoComplete: "postal-code" },
  { name: "country", label: "Country", autoComplete: "country-name", span: true },
];

function Checkout() {
  const { items, subtotal, clear } = useCart();
  const { user } = useSession();
  const router = useRouter();
  const qc = useQueryClient();
  const [payment, setPayment] = useState<"cod" | "card">("cod");
  const totals = calculateTotals(subtotal);

  const placeOrder = useMutation({
    mutationFn: (shippingAddress: ShippingAddress) =>
      api<{ order: Order }>("/orders", {
        method: "POST",
        body: {
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          shippingAddress,
          paymentMethod: payment,
        },
      }),
    onSuccess: ({ order }) => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["product"] });
      router.replace(`/orders/${order._id}?placed=1`);
      clear();
    },
  });

  if (placeOrder.isSuccess) return <PageLoader />;

  if (items.length === 0) {
    return (
      <div className="container-page py-16">
        <EmptyState title="Your cart is empty" action={{ href: "/products", label: "Browse products" }} />
      </div>
    );
  }

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const address = Object.fromEntries(FIELDS.map((f) => [f.name, String(fd.get(f.name) ?? "").trim()]));
    placeOrder.mutate(address as unknown as ShippingAddress);
  };

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Checkout</h1>

      <form onSubmit={onSubmit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="card p-6">
            <h2 className="font-semibold">Shipping address</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {FIELDS.map((f) => (
                <div key={f.name} className={f.span ? "sm:col-span-2" : ""}>
                  <label htmlFor={f.name} className="label">
                    {f.label}
                  </label>
                  <input
                    id={f.name}
                    name={f.name}
                    autoComplete={f.autoComplete}
                    defaultValue={f.name === "fullName" ? user?.name : undefined}
                    required
                    className="input"
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="card p-6">
            <h2 className="font-semibold">Payment</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <PaymentOption
                checked={payment === "cod"}
                onChange={() => setPayment("cod")}
                title="Cash on delivery"
                text="Pay when your order arrives."
              />
              <PaymentOption
                checked={payment === "card"}
                onChange={() => setPayment("card")}
                title="Card (demo)"
                text="Simulated payment — no real charge."
              />
            </div>
          </section>
        </div>

        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <OrderSummary {...totals}>
            <ul className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
              {items.map((i) => (
                <li key={i.productId} className="flex justify-between gap-3">
                  <span className="truncate text-muted">
                    {i.quantity} × {i.name}
                  </span>
                  <span>{formatPrice(i.price * i.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 space-y-3">
              <FormError message={placeOrder.isError ? errorMessage(placeOrder.error) : null} />
              <button type="submit" className="btn btn-primary w-full" disabled={placeOrder.isPending}>
                {placeOrder.isPending ? "Placing order…" : `Place order · ${formatPrice(totals.totalPrice)}`}
              </button>
            </div>
          </OrderSummary>
        </div>
      </form>
    </div>
  );
}

function PaymentOption({
  checked,
  onChange,
  title,
  text,
}: {
  checked: boolean;
  onChange: () => void;
  title: string;
  text: string;
}) {
  return (
    <label
      className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition ${
        checked ? "border-accent bg-accent/5" : "border-border hover:bg-surface-muted"
      }`}
    >
      <input type="radio" name="payment" checked={checked} onChange={onChange} className="mt-1 accent-[var(--accent)]" />
      <span>
        <span className="block text-sm font-medium">{title}</span>
        <span className="block text-xs text-muted">{text}</span>
      </span>
    </label>
  );
}
