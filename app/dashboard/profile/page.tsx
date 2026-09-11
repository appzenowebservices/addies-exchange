"use client";
import { Suspense } from "react";
import UserProfile from "~/components/dashboard/user/UserProfile";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <UserProfile />
    </Suspense>
  );
}
