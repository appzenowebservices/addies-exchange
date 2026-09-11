"use client";
import AdminLayout from "~/components/layout/AdminLayout";
import { Protected } from "~/components/guards";

export default function AdminRouteLayout({ children }: { children: React.ReactNode }) {
  return (
    <Protected role="admin">
      <AdminLayout>{children}</AdminLayout>
    </Protected>
  );
}
