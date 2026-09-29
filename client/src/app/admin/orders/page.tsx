import { Suspense } from "react";
import { PageLoader } from "@/components/states";
import { AdminOrders } from "./admin-orders";

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <AdminOrders />
    </Suspense>
  );
}
