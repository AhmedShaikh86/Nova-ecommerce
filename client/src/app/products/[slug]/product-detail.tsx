"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { ReturnIcon, ShieldIcon, TruckIcon } from "@/components/icons";
import { ProductCard } from "@/components/product-card";
import { ProductVisual } from "@/components/product-visual";
import { QuantityInput } from "@/components/quantity-input";
import { Rating } from "@/components/rating";
import { EmptyState, ErrorState, PageLoader } from "@/components/states";
import { useToast } from "@/components/toast";
import { ApiError, api } from "@/lib/api";
import { useCart } from "@/lib/cart";
import { capitalize, formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

export function ProductDetail({ slug }: { slug: string }) {
  const { data, isPending, error } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => api<{ product: Product; related: Product[] }>(`/products/${encodeURIComponent(slug)}`),
    retry: (count, err) => !(err instanceof ApiError && err.status === 404) && count < 1,
  });

  if (isPending) return <PageLoader />;
  if (error) {
    return (
      <div className="container-page py-16">
        {error instanceof ApiError && error.status === 404 ? (
          <EmptyState
            title="Product not found"
            description="It may have been removed or the link is incorrect."
            action={{ href: "/products", label: "Browse products" }}
          />
        ) : (
          <ErrorState message="Couldn't load this product." />
        )}
      </div>
    );
  }

  return <ProductView key={data.product._id} product={data.product} related={data.related} />;
}

function ProductView({ product, related }: { product: Product; related: Product[] }) {
  const { add, items } = useCart();
  const toast = useToast();
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  const inCart = items.find((i) => i.productId === product._id)?.quantity ?? 0;
  const available = Math.max(0, product.stock - inCart);
  const onSale = product.compareAtPrice && product.compareAtPrice > product.price;

  return (
    <div className="container-page py-10">
      <nav className="text-sm text-muted" aria-label="Breadcrumb">
        <Link href="/products" className="hover:text-foreground">
          Shop
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/products?category=${product.category}`} className="hover:text-foreground">
          {capitalize(product.category)}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div className="space-y-3">
          <ProductVisual
            category={product.category}
            image={product.images[activeImage]}
            name={product.name}
            className="card aspect-square"
            iconSize={140}
          />
          {product.images.length > 1 && (
            <div className="grid grid-cols-5 gap-3">
              {product.images.map((img, i) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={`overflow-hidden rounded-xl border-2 ${
                    i === activeImage ? "border-accent" : "border-transparent"
                  }`}
                  aria-label={`Show image ${i + 1}`}
                >
                  <ProductVisual category={product.category} image={img} name="" className="aspect-square" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-sm font-medium text-accent">{product.brand}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">{product.name}</h1>
          <div className="mt-3">
            <Rating value={product.rating} count={product.numReviews} />
          </div>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-3xl font-semibold">{formatPrice(product.price)}</span>
            {onSale && (
              <>
                <span className="text-lg text-muted line-through">{formatPrice(product.compareAtPrice!)}</span>
                <span className="rounded-full bg-accent/15 px-2.5 py-1 text-xs font-semibold text-accent">
                  Save {formatPrice(product.compareAtPrice! - product.price)}
                </span>
              </>
            )}
          </div>

          <p className="mt-6 leading-relaxed text-muted">{product.description}</p>

          <p className="mt-6 text-sm">
            {product.stock === 0 ? (
              <span className="font-medium text-danger">Out of stock</span>
            ) : product.stock <= 5 ? (
              <span className="font-medium text-warning">Only {product.stock} left in stock</span>
            ) : (
              <span className="font-medium text-success">In stock</span>
            )}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <QuantityInput value={Math.min(qty, Math.max(1, available))} max={Math.max(1, available)} onChange={setQty} />
            <button
              type="button"
              className="btn btn-primary flex-1 sm:flex-none sm:px-10"
              disabled={available === 0}
              onClick={() => {
                add(product, Math.min(qty, available));
                setQty(1);
                toast(`${product.name} added to cart`);
              }}
            >
              {product.stock === 0 ? "Sold out" : available === 0 ? "Max in cart" : "Add to cart"}
            </button>
          </div>
          {inCart > 0 && (
            <p className="mt-3 text-sm text-muted">
              {inCart} in your cart ·{" "}
              <Link href="/cart" className="font-medium text-accent hover:underline">
                View cart
              </Link>
            </p>
          )}

          <div className="mt-8 grid grid-cols-3 gap-3 text-center text-xs text-muted">
            <div className="card flex flex-col items-center gap-2 p-3">
              <TruckIcon /> Free shipping over $100
            </div>
            <div className="card flex flex-col items-center gap-2 p-3">
              <ReturnIcon /> 30-day returns
            </div>
            <div className="card flex flex-col items-center gap-2 p-3">
              <ShieldIcon /> 2-year warranty
            </div>
          </div>

          {product.specs.length > 0 && (
            <div className="mt-8">
              <h2 className="font-semibold">Specifications</h2>
              <dl className="mt-3 divide-y divide-border rounded-2xl border border-border">
                {product.specs.map((s) => (
                  <div key={s.label} className="grid grid-cols-[40%_1fr] gap-4 px-4 py-3 text-sm">
                    <dt className="text-muted">{s.label}</dt>
                    <dd>{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="text-2xl font-semibold tracking-tight">You may also like</h2>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
