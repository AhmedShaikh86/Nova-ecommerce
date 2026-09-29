import { Suspense } from "react";
import { PageLoader } from "@/components/states";
import { OrderDetail } from "./order-detail";

export default async function OrderPage({ params }: PageProps<"/orders/[id]">) {
  const { id } = await params;
  return (
    <Suspense fallback={<PageLoader />}>
      <OrderDetail id={id} />
    </Suspense>
  );
}
