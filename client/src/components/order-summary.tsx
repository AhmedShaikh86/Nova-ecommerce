import { formatPrice } from "@/lib/format";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/pricing";

interface Props {
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
  showFreeShippingHint?: boolean;
  children?: React.ReactNode;
}

export function OrderSummary({
  itemsPrice,
  shippingPrice,
  taxPrice,
  totalPrice,
  showFreeShippingHint,
  children,
}: Props) {
  const remaining = FREE_SHIPPING_THRESHOLD - itemsPrice;
  return (
    <div className="card p-6">
      <h2 className="font-semibold">Order summary</h2>
      <dl className="mt-4 space-y-2.5 text-sm">
        <Row label="Subtotal" value={formatPrice(itemsPrice)} />
        <Row label="Shipping" value={shippingPrice === 0 ? "Free" : formatPrice(shippingPrice)} />
        <Row label="Tax (5%)" value={formatPrice(taxPrice)} />
        <div className="border-t border-border pt-3">
          <Row label="Total" value={formatPrice(totalPrice)} strong />
        </div>
      </dl>
      {showFreeShippingHint && remaining > 0 && (
        <p className="mt-4 rounded-xl bg-accent/10 px-3 py-2 text-xs text-accent">
          Add {formatPrice(remaining)} more for free shipping.
        </p>
      )}
      {children}
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between ${strong ? "text-base font-semibold" : ""}`}>
      <dt className={strong ? "" : "text-muted"}>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
