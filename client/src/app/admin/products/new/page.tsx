import Link from "next/link";
import { ProductForm } from "../product-form";

export default function NewProductPage() {
  return (
    <div>
      <Link href="/admin/products" className="text-sm text-muted hover:text-foreground">
        ← Products
      </Link>
      <h2 className="mb-6 mt-2 text-xl font-semibold">New product</h2>
      <ProductForm />
    </div>
  );
}
