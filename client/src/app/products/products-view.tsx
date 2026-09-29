"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ProductCard, ProductCardSkeleton } from "@/components/product-card";
import { EmptyState, ErrorState } from "@/components/states";
import { api, qs } from "@/lib/api";
import { capitalize } from "@/lib/format";
import type { Facets, Paginated, Product, SortKey } from "@/lib/types";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "rating", label: "Top rated" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "Name A–Z" },
];

export function ProductsView() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filters = {
    q: params.get("q") ?? "",
    category: params.get("category") ?? "",
    brand: params.get("brand") ?? "",
    minPrice: params.get("minPrice") ?? "",
    maxPrice: params.get("maxPrice") ?? "",
    inStock: params.get("inStock") ?? "",
    sort: (params.get("sort") as SortKey) ?? "newest",
    page: Number(params.get("page") ?? 1),
  };

  const update = (changes: Partial<Record<keyof typeof filters, string | number>>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(changes)) {
      if (v === "" || v === undefined) next.delete(k);
      else next.set(k, String(v));
    }
    if (!("page" in changes)) next.delete("page");
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  };

  const products = useQuery({
    queryKey: ["products", filters],
    queryFn: () => api<Paginated<Product>>(`/products${qs({ ...filters, limit: 12 })}`),
    placeholderData: keepPreviousData,
  });

  const facets = useQuery({
    queryKey: ["products", "facets"],
    queryFn: () => api<Facets>("/products/facets"),
    staleTime: 5 * 60_000,
  });

  const selectedBrands = filters.brand ? filters.brand.split(",") : [];
  const toggleBrand = (b: string) => {
    const next = selectedBrands.includes(b)
      ? selectedBrands.filter((x) => x !== b)
      : [...selectedBrands, b];
    update({ brand: next.join(",") });
  };

  const onPriceSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    update({ minPrice: String(fd.get("minPrice") ?? ""), maxPrice: String(fd.get("maxPrice") ?? "") });
  };

  const title = filters.q
    ? `Results for “${filters.q}”`
    : filters.category
      ? capitalize(filters.category)
      : "All products";

  const hasFilters = Boolean(
    filters.q || filters.category || filters.brand || filters.minPrice || filters.maxPrice || filters.inStock,
  );

  return (
    <div className="container-page py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted">
            {products.data ? `${products.data.total} products` : "Loading…"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn btn-outline btn-sm lg:hidden"
            onClick={() => setFiltersOpen((o) => !o)}
          >
            Filters
          </button>
          <label className="sr-only" htmlFor="sort">
            Sort by
          </label>
          <select
            id="sort"
            value={filters.sort}
            onChange={(e) => update({ sort: e.target.value })}
            className="input h-9 w-auto rounded-full pr-8 text-xs"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className={`${filtersOpen ? "block" : "hidden"} space-y-8 lg:block`}>
          <FilterGroup title="Category">
            <FilterOption
              active={!filters.category}
              onClick={() => update({ category: "" })}
              label="All"
            />
            {facets.data?.categories.map((c) => (
              <FilterOption
                key={c.slug}
                active={filters.category === c.slug}
                onClick={() => update({ category: c.slug })}
                label={capitalize(c.slug)}
                count={c.count}
              />
            ))}
          </FilterGroup>

          <FilterGroup title="Brand">
            {facets.data?.brands.map((b) => (
              <label key={b} className="flex cursor-pointer items-center gap-2.5 py-1 text-sm">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(b)}
                  onChange={() => toggleBrand(b)}
                  className="h-4 w-4 accent-[var(--accent)]"
                />
                {b}
              </label>
            ))}
          </FilterGroup>

          <FilterGroup title="Price">
            <form onSubmit={onPriceSubmit} className="flex items-center gap-2" key={`${filters.minPrice}-${filters.maxPrice}`}>
              <input
                name="minPrice"
                type="number"
                min={0}
                placeholder="Min"
                defaultValue={filters.minPrice}
                className="input h-9 px-3"
                aria-label="Minimum price"
              />
              <span className="text-muted">–</span>
              <input
                name="maxPrice"
                type="number"
                min={0}
                placeholder="Max"
                defaultValue={filters.maxPrice}
                className="input h-9 px-3"
                aria-label="Maximum price"
              />
              <button type="submit" className="btn btn-outline btn-sm shrink-0 px-3">
                Go
              </button>
            </form>
          </FilterGroup>

          <label className="flex cursor-pointer items-center gap-2.5 text-sm">
            <input
              type="checkbox"
              checked={filters.inStock === "true"}
              onChange={(e) => update({ inStock: e.target.checked ? "true" : "" })}
              className="h-4 w-4 accent-[var(--accent)]"
            />
            In stock only
          </label>

          {hasFilters && (
            <button type="button" className="btn btn-ghost btn-sm w-full" onClick={() => router.push(pathname)}>
              Clear all filters
            </button>
          )}
        </aside>

        <section>
          {products.isError ? (
            <ErrorState message="Couldn't load products. Is the API server running?" />
          ) : products.isPending ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }, (_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.data.items.length === 0 ? (
            <EmptyState
              title="No products found"
              description="Try adjusting your search or filters."
              action={{ href: "/products", label: "Clear filters" }}
            />
          ) : (
            <>
              <div
                className={`grid grid-cols-1 gap-5 transition-opacity sm:grid-cols-2 xl:grid-cols-3 ${
                  products.isPlaceholderData ? "opacity-60" : ""
                }`}
              >
                {products.data.items.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
              {products.data.totalPages > 1 && (
                <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    disabled={filters.page <= 1}
                    onClick={() => update({ page: filters.page - 1 })}
                  >
                    Previous
                  </button>
                  <span className="px-3 text-sm text-muted">
                    Page {products.data.page} of {products.data.totalPages}
                  </span>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    disabled={filters.page >= products.data.totalPages}
                    onClick={() => update({ page: filters.page + 1 })}
                  >
                    Next
                  </button>
                </nav>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">{title}</h3>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function FilterOption({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-left text-sm transition ${
        active ? "bg-foreground text-background" : "hover:bg-surface-muted"
      }`}
    >
      {label}
      {count !== undefined && <span className={active ? "opacity-70" : "text-muted"}>{count}</span>}
    </button>
  );
}
