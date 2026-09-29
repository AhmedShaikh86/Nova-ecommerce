import { capitalize } from "@/lib/format";
import type { OrderStatus } from "@/lib/types";

const styles: Record<OrderStatus, string> = {
  pending: "bg-warning/15 text-warning",
  processing: "bg-accent/15 text-accent",
  shipped: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  delivered: "bg-success/15 text-success",
  cancelled: "bg-danger/15 text-danger",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}>
      {capitalize(status)}
    </span>
  );
}
