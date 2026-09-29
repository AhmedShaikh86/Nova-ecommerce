import type { Metadata } from "next";
import { ProductDetail } from "./product-detail";

const API_URL = process.env.API_URL ?? "http://localhost:4000";

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await fetch(`${API_URL}/api/products/${encodeURIComponent(slug)}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return { title: "Product not found" };
    const { product } = (await res.json()) as { product: { name: string; description: string } };
    return { title: product.name, description: product.description };
  } catch {
    return { title: "Product" };
  }
}

export default async function ProductPage({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  return <ProductDetail slug={slug} />;
}
