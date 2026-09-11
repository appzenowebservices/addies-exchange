"use client";
import { Suspense } from "react";
import AuthPage from "~/components/auth/AuthPage";
import { PublicOnly } from "~/components/guards";

export default function AuthRoute() {
  return (
    <PublicOnly>
      <Suspense fallback={null}>
        <AuthPage />
      </Suspense>
    </PublicOnly>
  );
}
