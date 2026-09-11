"use client";
import UserLayout from "~/components/layout/UserLayout";
import { Protected } from "~/components/guards";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Protected role="user">
      <UserLayout>{children}</UserLayout>
    </Protected>
  );
}
