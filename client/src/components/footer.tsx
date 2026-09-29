import Link from "next/link";
import { capitalize } from "@/lib/format";
import { CATEGORIES } from "@/lib/types";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-xl font-bold tracking-[0.2em]">NOVA</p>
          <p className="mt-3 max-w-xs text-sm text-muted">
            Technology, refined. Premium laptops, audio and desk gear, curated for people who care
            about their tools.
          </p>
        </div>
        <FooterCol title="Shop">
          {CATEGORIES.map((c) => (
            <Link key={c} href={`/products?category=${c}`} className="hover:text-foreground">
              {capitalize(c)}
            </Link>
          ))}
        </FooterCol>
        <FooterCol title="Account">
          <Link href="/account" className="hover:text-foreground">
            My account
          </Link>
          <Link href="/account#orders" className="hover:text-foreground">
            Order history
          </Link>
          <Link href="/cart" className="hover:text-foreground">
            Cart
          </Link>
        </FooterCol>
        <FooterCol title="Service">
          <span>Free shipping over $100</span>
          <span>30-day returns</span>
          <span>2-year warranty</span>
        </FooterCol>
      </div>
      <div className="border-t border-border">
        <p className="container-page py-6 text-xs text-muted">
          © {new Date().getFullYear()} NOVA. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm font-semibold">{title}</p>
      <div className="mt-3 flex flex-col gap-2 text-sm text-muted">{children}</div>
    </div>
  );
}
