"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Paginated, Product } from "@/lib/types";
import { ProductCard, ProductCardSkeleton } from "./product-card";
import { ErrorState } from "./states";

export function FeaturedProducts() {
  const { data, isPending, isError } = useQuery({
    queryKey: ["products", "featured"],
    queryFn: () => api<Paginated<Product>>("/products?featured=true&sort=rating&limit=8"),
  });

  if (isError) return <ErrorState message="Couldn't load products. Is the API server running?" />;

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {isPending
        ? Array.from({ length: 4 }, (_, i) => <ProductCardSkeleton key={i} />)
        : data.items.map((p) => <ProductCard key={p._id} product={p} />)}
    </div>
  );
}
