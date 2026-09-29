"use client";

import Link from "next/link";
import { TrashIcon } from "@/components/icons";
import { OrderSummary } from "@/components/order-summary";
import { ProductVisual } from "@/components/product-visual";
import { QuantityInput } from "@/components/quantity-input";
import { EmptyState } from "@/components/states";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { calculateTotals } from "@/lib/pricing";

export default function CartPage() {
  const { items, subtotal, count, setQuantity, remove } = useCart();
  const totals = calculateTotals(subtotal);

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Your cart</h1>

      {items.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="Your cart is empty"
            description="Looks like you haven't added anything yet."
            action={{ href: "/products", label: "Start shopping" }}
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <ul className="card divide-y divide-border">
            {items.map((item) => (
              <li key={item.productId} className="flex gap-4 p-4 sm:p-5">
                <Link href={`/products/${item.slug}`} className="shrink-0">
                  <ProductVisual
                    category={item.category}
                    image={item.image}
                    name={item.name}
                    className="h-24 w-24 rounded-xl"
                    iconSize={32}
                  />
                </Link>
                <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <Link href={`/products/${item.slug}`} className="font-medium hover:text-accent">
                      {item.name}
                    </Link>
                    <p className="text-sm text-muted">{formatPrice(item.price)} each</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <QuantityInput
                      value={item.quantity}
                      max={Math.min(item.stock, 20)}
                      onChange={(q) => setQuantity(item.productId, q)}
                    />
                    <span className="w-24 text-right font-semibold">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                    <button
                      type="button"
                      onClick={() => remove(item.productId)}
                      className="rounded-full p-2 text-muted hover:bg-surface-muted hover:text-danger"
                      aria-label={`Remove ${item.name}`}
                    >
                      <TrashIcon width={18} height={18} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <OrderSummary {...totals} showFreeShippingHint>
              <Link href="/checkout" className="btn btn-primary mt-6 w-full">
                Checkout ({count} {count === 1 ? "item" : "items"})
              </Link>
              <Link href="/products" className="btn btn-ghost mt-2 w-full">
                Continue shopping
              </Link>
            </OrderSummary>
          </div>
        </div>
      )}
    </div>
  );
}
