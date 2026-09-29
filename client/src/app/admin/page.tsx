"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { OrderStatusBadge } from "@/components/order-status";
import { ErrorState, PageLoader } from "@/components/states";
import { api } from "@/lib/api";
import { formatDate, formatPrice, shortId } from "@/lib/format";
import { ORDER_STATUSES, type AdminStats } from "@/lib/types";

export default function AdminDashboard() {
  const { data, isPending, isError } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => api<AdminStats>("/admin/stats"),
  });

  if (isPending) return <PageLoader />;
  if (isError) return <ErrorState message="Couldn't load dashboard stats." />;

  const tiles = [
    { label: "Revenue", value: formatPrice(data.revenue) },
    { label: "Orders", value: data.orderCount.toLocaleString() },
    { label: "Products", value: data.productCount.toLocaleString() },
    { label: "Customers", value: data.customerCount.toLocaleString() },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className="card p-5">
            <p className="text-sm text-muted">{t.label}</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums">{t.value}</p>
          </div>
        ))}
      </div>

      <div className="card flex flex-wrap gap-x-8 gap-y-3 p-5">
        {ORDER_STATUSES.map((s) => (
          <Link key={s} href={`/admin/orders?status=${s}`} className="flex items-center gap-2 hover:opacity-80">
            <OrderStatusBadge status={s} />
            <span className="font-semibold tabular-nums">{data.ordersByStatus[s]}</span>
          </Link>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Recent orders</h2>
            <Link href="/admin/orders" className="text-sm text-accent hover:underline">
              View all
            </Link>
          </div>
          {data.recentOrders.length === 0 ? (
            <p className="mt-4 text-sm text-muted">No orders yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {data.recentOrders.map((o) => (
                <li key={o._id}>
                  <Link href={`/orders/${o._id}`} className="flex items-center justify-between gap-3 py-3 text-sm">
                    <div>
                      <p className="font-medium">{shortId(o._id)}</p>
                      <p className="text-muted">
                        {typeof o.user === "object" ? o.user.name : "—"} · {formatDate(o.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <OrderStatusBadge status={o.status} />
                      <span className="font-semibold">{formatPrice(o.totalPrice)}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Low stock</h2>
            <Link href="/admin/products" className="text-sm text-accent hover:underline">
              Manage
            </Link>
          </div>
          {data.lowStock.length === 0 ? (
            <p className="mt-4 text-sm text-muted">All products are well stocked.</p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {data.lowStock.map((p) => (
                <li key={p._id}>
                  <Link
                    href={`/admin/products/${p._id}`}
                    className="flex items-center justify-between py-3 text-sm"
                  >
                    <span className="font-medium">{p.name}</span>
                    <span className={p.stock === 0 ? "font-semibold text-danger" : "font-semibold text-warning"}>
                      {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
