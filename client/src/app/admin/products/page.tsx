"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { ProductVisual } from "@/components/product-visual";
import { ErrorState, PageLoader } from "@/components/states";
import { useToast } from "@/components/toast";
import { api, errorMessage, qs } from "@/lib/api";
import { capitalize, formatPrice } from "@/lib/format";
import type { Paginated, Product } from "@/lib/types";

export default function AdminProducts() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const qc = useQueryClient();
  const toast = useToast();

  const { data, isPending, isError, isPlaceholderData } = useQuery({
    queryKey: ["products", "admin", q, page],
    queryFn: () => api<Paginated<Product>>(`/products${qs({ q, page, limit: 20, sort: "name" })}`),
    placeholderData: keepPreviousData,
  });

  const remove = useMutation({
    mutationFn: (id: string) => api<void>(`/admin/products/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast("Product deleted");
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (err) => toast(errorMessage(err), "error"),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          placeholder="Search products…"
          className="input max-w-xs rounded-full"
          aria-label="Search products"
        />
        <Link href="/admin/products/new" className="btn btn-primary">
          + New product
        </Link>
      </div>

      {isPending ? (
        <PageLoader />
      ) : isError ? (
        <ErrorState message="Couldn't load products." />
      ) : (
        <div className={`card overflow-x-auto ${isPlaceholderData ? "opacity-60" : ""}`}>
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-border text-left text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="p-4 font-medium">Product</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Price</th>
                <th className="p-4 font-medium">Stock</th>
                <th className="p-4 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.items.map((p) => (
                <tr key={p._id}>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <ProductVisual
                        category={p.category}
                        image={p.images[0]}
                        name={p.name}
                        className="h-10 w-10 shrink-0 rounded-lg"
                        iconSize={18}
                      />
                      <div>
                        <p className="font-medium">
                          {p.name}
                          {p.featured && <span className="ml-2 text-xs text-accent">Featured</span>}
                        </p>
                        <p className="text-xs text-muted">{p.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">{capitalize(p.category)}</td>
                  <td className="p-4">{formatPrice(p.price)}</td>
                  <td className={`p-4 font-medium ${p.stock === 0 ? "text-danger" : p.stock <= 5 ? "text-warning" : ""}`}>
                    {p.stock}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/products/${p._id}`} className="btn btn-outline btn-sm">
                        Edit
                      </Link>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm text-danger"
                        disabled={remove.isPending}
                        onClick={() => {
                          if (confirm(`Delete "${p.name}"? This cannot be undone.`)) remove.mutate(p._id);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {data.items.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button type="button" className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Previous
          </button>
          <span className="px-3 text-sm text-muted">
            Page {data.page} of {data.totalPages}
          </span>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            disabled={page >= data.totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
