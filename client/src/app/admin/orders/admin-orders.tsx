"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { OrderStatusBadge } from "@/components/order-status";
import { ErrorState, PageLoader } from "@/components/states";
import { useToast } from "@/components/toast";
import { api, errorMessage, qs } from "@/lib/api";
import { capitalize, formatDate, formatPrice, shortId } from "@/lib/format";
import { ORDER_STATUSES, type Order, type OrderStatus } from "@/lib/types";

interface OrdersResponse {
  orders: Order[];
  page: number;
  total: number;
  totalPages: number;
}

export function AdminOrders() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const status = params.get("status") ?? "";
  const page = Number(params.get("page") ?? 1);
  const qc = useQueryClient();
  const toast = useToast();

  const setParams = (next: { status?: string; page?: number }) => {
    const sp = new URLSearchParams();
    const s = next.status ?? status;
    if (s) sp.set("status", s);
    if (next.page && next.page > 1) sp.set("page", String(next.page));
    router.push(`${pathname}${sp.size ? `?${sp}` : ""}`);
  };

  const { data, isPending, isError, isPlaceholderData } = useQuery({
    queryKey: ["admin", "orders", status, page],
    queryFn: () => api<OrdersResponse>(`/admin/orders${qs({ status, page })}`),
    placeholderData: keepPreviousData,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      api<{ order: Order }>(`/admin/orders/${id}/status`, { method: "PATCH", body: { status } }),
    onSuccess: () => {
      toast("Order updated");
      qc.invalidateQueries({ queryKey: ["admin"] });
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (err) => toast(errorMessage(err), "error"),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {["", ...ORDER_STATUSES].map((s) => (
          <button
            key={s || "all"}
            type="button"
            onClick={() => setParams({ status: s, page: 1 })}
            className={`btn btn-sm ${status === s ? "btn-primary" : "btn-outline"}`}
          >
            {s ? capitalize(s) : "All"}
          </button>
        ))}
      </div>

      {isPending ? (
        <PageLoader />
      ) : isError ? (
        <ErrorState message="Couldn't load orders." />
      ) : (
        <div className={`card overflow-x-auto ${isPlaceholderData ? "opacity-60" : ""}`}>
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b border-border text-left text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="p-4 font-medium">Order</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Total</th>
                <th className="p-4 font-medium">Payment</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.orders.map((o) => (
                <tr key={o._id}>
                  <td className="p-4">
                    <Link href={`/orders/${o._id}`} className="font-medium text-accent hover:underline">
                      {shortId(o._id)}
                    </Link>
                  </td>
                  <td className="p-4">
                    {typeof o.user === "object" ? (
                      <>
                        <p className="font-medium">{o.user.name}</p>
                        <p className="text-xs text-muted">{o.user.email}</p>
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="p-4">{formatDate(o.createdAt)}</td>
                  <td className="p-4 font-semibold">{formatPrice(o.totalPrice)}</td>
                  <td className="p-4">
                    <span className={o.isPaid ? "text-success" : "text-muted"}>
                      {o.paymentMethod.toUpperCase()} · {o.isPaid ? "Paid" : "Unpaid"}
                    </span>
                  </td>
                  <td className="p-4">
                    {o.status === "cancelled" ? (
                      <OrderStatusBadge status="cancelled" />
                    ) : (
                      <select
                        value={o.status}
                        disabled={updateStatus.isPending}
                        onChange={(e) => {
                          const next = e.target.value as OrderStatus;
                          if (next === "cancelled" && !confirm("Cancel this order and restock its items?")) return;
                          updateStatus.mutate({ id: o._id, status: next });
                        }}
                        className="input h-9 w-auto rounded-full text-xs"
                        aria-label={`Status for order ${shortId(o._id)}`}
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {capitalize(s)}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                </tr>
              ))}
              {data.orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            className="btn btn-outline btn-sm"
            disabled={page <= 1}
            onClick={() => setParams({ page: page - 1 })}
          >
            Previous
          </button>
          <span className="px-3 text-sm text-muted">
            Page {data.page} of {data.totalPages}
          </span>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            disabled={page >= data.totalPages}
            onClick={() => setParams({ page: page + 1 })}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
