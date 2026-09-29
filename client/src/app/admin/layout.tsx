import type { Metadata } from "next";
import { AuthGuard } from "@/components/auth-guard";
import { AdminNav } from "./admin-nav";

export const metadata: Metadata = { title: "Admin" };

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <AuthGuard admin>
      <div className="container-page py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold tracking-tight">Admin</h1>
          <AdminNav />
        </div>
        <div className="mt-8">{children}</div>
      </div>
    </AuthGuard>
  );
}
