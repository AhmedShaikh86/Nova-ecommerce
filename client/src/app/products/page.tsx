import type { Metadata } from "next";
import { Suspense } from "react";
import { PageLoader } from "@/components/states";
import { ProductsView } from "./products-view";

export const metadata: Metadata = { title: "Shop" };

export default function ProductsPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <ProductsView />
    </Suspense>
  );
}
