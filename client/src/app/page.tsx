import Link from "next/link";
import { FeaturedProducts } from "@/components/featured-products";
import { ArrowRightIcon, CategoryIcon, ReturnIcon, ShieldIcon, TruckIcon } from "@/components/icons";
import { capitalize } from "@/lib/format";
import { CATEGORIES } from "@/lib/types";

const perks = [
  { icon: TruckIcon, title: "Free shipping", text: "On every order over $100" },
  { icon: ReturnIcon, title: "30-day returns", text: "No questions asked" },
  { icon: ShieldIcon, title: "2-year warranty", text: "On all NOVA products" },
];

export default function Home() {
  return (
    <>
      {/* Fills the first screen below the sticky header (h-16 + 1px border);
          svh keeps mobile browser toolbars from pushing content off-screen. */}
      <section className="relative flex min-h-[calc(100svh-4rem-1px)] items-center overflow-hidden border-b border-border">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[900px] max-w-[160vw] -translate-x-1/2 rounded-full bg-accent/20 blur-3xl"
        />
        <div className="container-page relative flex flex-col items-center py-16 text-center">
          <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted">
            New season · Up to 20% off selected gear
          </span>
          <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
            Technology, <span className="text-accent">refined.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted sm:text-xl">
            Laptops, audio and desk gear chosen for design, performance and longevity. Everything you
            need for a better setup.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/products" className="btn btn-primary">
              Shop all products <ArrowRightIcon width={16} height={16} />
            </Link>
            <Link href="/products?sort=price-asc" className="btn btn-outline">
              Browse deals
            </Link>
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <h2 className="text-2xl font-semibold tracking-tight">Shop by category</h2>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.map((c) => (
            <Link
              key={c}
              href={`/products?category=${c}`}
              className="card group flex flex-col items-center gap-3 px-4 py-8 transition hover:border-accent/50 hover:bg-surface-muted"
            >
              <CategoryIcon
                category={c}
                width={32}
                height={32}
                strokeWidth={1.5}
                className="text-muted transition group-hover:text-accent"
              />
              <span className="text-sm font-medium">{capitalize(c)}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-page">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Featured</h2>
            <p className="mt-1 text-sm text-muted">Our most-loved gear right now.</p>
          </div>
          <Link href="/products" className="text-sm font-medium text-accent hover:underline">
            View all
          </Link>
        </div>
        <div className="mt-6">
          <FeaturedProducts />
        </div>
      </section>

      <section className="container-page mt-20">
        <div className="card grid gap-6 p-8 sm:grid-cols-3">
          {perks.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                <Icon />
              </div>
              <div>
                <p className="font-medium">{title}</p>
                <p className="text-sm text-muted">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
