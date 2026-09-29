"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";
import { ProductVisual } from "./product-visual";
import { Rating } from "./rating";
import { useToast } from "./toast";

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const toast = useToast();
  const onSale = product.compareAtPrice && product.compareAtPrice > product.price;
  const outOfStock = product.stock === 0;

  return (
    <div className="group card flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5">
      <Link href={`/products/${product.slug}`} className="relative block">
        <ProductVisual
          category={product.category}
          image={product.images[0]}
          name={product.name}
          className="aspect-[4/3] transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute left-3 top-3 flex gap-1.5">
          {onSale && (
            <span className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold text-accent-foreground">
              Sale
            </span>
          )}
          {outOfStock && (
            <span className="rounded-full bg-foreground px-2.5 py-1 text-[11px] font-semibold text-background">
              Sold out
            </span>
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between text-xs text-muted">
          <span>{product.brand}</span>
          <Rating value={product.rating} />
        </div>
        <Link href={`/products/${product.slug}`} className="font-medium leading-snug hover:text-accent">
          {product.name}
        </Link>
        <div className="mt-auto flex items-end justify-between pt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-semibold">{formatPrice(product.price)}</span>
            {onSale && (
              <span className="text-sm text-muted line-through">{formatPrice(product.compareAtPrice!)}</span>
            )}
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            disabled={outOfStock}
            onClick={() => {
              add(product);
              toast(`${product.name} added to cart`);
            }}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="aspect-[4/3] animate-pulse bg-surface-muted" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-1/3 animate-pulse rounded bg-surface-muted" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-surface-muted" />
        <div className="h-5 w-1/4 animate-pulse rounded bg-surface-muted" />
      </div>
    </div>
  );
}
