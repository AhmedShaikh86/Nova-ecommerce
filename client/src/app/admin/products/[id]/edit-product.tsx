"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ErrorState, PageLoader } from "@/components/states";
import { api } from "@/lib/api";
import type { Product } from "@/lib/types";
import { ProductForm } from "../product-form";

export function EditProduct({ id }: { id: string }) {
  const { data, isPending, isError } = useQuery({
    queryKey: ["admin", "product", id],
    queryFn: () => api<{ product: Product }>(`/admin/products/${id}`),
  });

  return (
    <div>
      <Link href="/admin/products" className="text-sm text-muted hover:text-foreground">
        ← Products
      </Link>
      <h2 className="mb-6 mt-2 text-xl font-semibold">Edit product</h2>
      {isPending ? (
        <PageLoader />
      ) : isError ? (
        <ErrorState message="Product not found." />
      ) : (
        <ProductForm key={data.product._id} product={data.product} />
      )}
    </div>
  );
}
