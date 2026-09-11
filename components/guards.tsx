"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "~/context/AuthContext";

export function Protected({ children, role }: { children: React.ReactNode; role?: "admin" | "user" }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/auth");
    else if (role && (user as { role?: string }).role !== role) router.replace("/");
  }, [user, loading, role, router]);

  if (loading) return <div className="full-screen-loader"><div className="spinner spinner-blue" style={{ width: 36, height: 36 }} /></div>;
  if (!user) return null;
  if (role && (user as { role?: string }).role !== role) return null;
  return <>{children}</>;
}

export function PublicOnly({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading || !user) return;
    router.replace((user as { role?: string }).role === "admin" ? "/admin" : "/dashboard");
  }, [user, loading, router]);

  if (loading) return null;
  if (user) return null;
  return <>{children}</>;
}
