"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useAuthActions, useSession } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { capitalize } from "@/lib/format";
import { CATEGORIES } from "@/lib/types";
import { CartIcon, CloseIcon, MenuIcon, SearchIcon, UserIcon } from "./icons";

export function Header() {
  const { count } = useCart();
  const { user, isAdmin } = useSession();
  const { logout } = useAuthActions();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Close menus whenever the route changes (state adjusted during render, not in an effect).
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMenuOpen(false);
    setUserOpen(false);
  }

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = search.trim();
    router.push(q ? `/products?q=${encodeURIComponent(q)}` : "/products");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container-page flex h-16 items-center gap-4">
        <button
          type="button"
          className="btn-ghost -ml-2 rounded-full p-2 lg:hidden"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>

        <Link href="/" className="text-xl font-bold tracking-[0.2em]">
          NOVA
        </Link>

        <nav className="ml-6 hidden items-center gap-1 lg:flex" aria-label="Categories">
          {CATEGORIES.map((c) => (
            <Link
              key={c}
              href={`/products?category=${c}`}
              className="rounded-full px-3 py-1.5 text-sm text-muted transition hover:bg-surface-muted hover:text-foreground"
            >
              {capitalize(c)}
            </Link>
          ))}
        </nav>

        <form onSubmit={onSearch} className="ml-auto hidden md:block" role="search">
          <label className="relative block">
            <span className="sr-only">Search products</span>
            <SearchIcon
              width={16}
              height={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products"
              className="input h-10 w-56 rounded-full pl-10 lg:w-64"
            />
          </label>
        </form>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <div className="relative">
            {user ? (
              <button
                type="button"
                className="flex h-10 items-center gap-2 rounded-full px-3 text-sm hover:bg-surface-muted"
                onClick={() => setUserOpen((o) => !o)}
                aria-expanded={userOpen}
                aria-haspopup="menu"
              >
                <UserIcon />
                <span className="hidden max-w-24 truncate sm:inline">{user.name.split(" ")[0]}</span>
              </button>
            ) : (
              <Link href="/login" className="flex h-10 items-center gap-2 rounded-full px-3 text-sm hover:bg-surface-muted">
                <UserIcon />
                <span className="hidden sm:inline">Sign in</span>
              </Link>
            )}
            {user && userOpen && (
              <div
                role="menu"
                className="card absolute right-0 top-12 w-52 overflow-hidden p-1.5 shadow-xl shadow-black/10"
              >
                <div className="px-3 py-2 text-xs text-muted">{user.email}</div>
                <MenuLink href="/account">My account</MenuLink>
                <MenuLink href="/account#orders">My orders</MenuLink>
                {isAdmin && <MenuLink href="/admin">Admin dashboard</MenuLink>}
                <button
                  type="button"
                  role="menuitem"
                  className="w-full rounded-lg px-3 py-2 text-left text-sm text-danger hover:bg-surface-muted"
                  onClick={() => {
                    setUserOpen(false);
                    logout.mutate(undefined, { onSettled: () => router.push("/") });
                  }}
                >
                  Sign out
                </button>
              </div>
            )}
          </div>

          <Link
            href="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-muted"
            aria-label={`Cart, ${count} items`}
          >
            <CartIcon />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-border lg:hidden">
          <div className="container-page space-y-4 py-4">
            <form onSubmit={onSearch} role="search" className="md:hidden">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products"
                className="input rounded-full"
                aria-label="Search products"
              />
            </form>
            <nav className="grid grid-cols-2 gap-2" aria-label="Categories">
              <Link href="/products" className="btn btn-outline btn-sm">
                All products
              </Link>
              {CATEGORIES.map((c) => (
                <Link key={c} href={`/products?category=${c}`} className="btn btn-outline btn-sm">
                  {capitalize(c)}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

function MenuLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} role="menuitem" className="block rounded-lg px-3 py-2 text-sm hover:bg-surface-muted">
      {children}
    </Link>
  );
}
