"use client";
// T3 Auth provider — NextAuth (credentials) + tRPC, same `useAuth` interface
// as the old Vite app so all migrated components keep working.

import React, { createContext, useContext, useCallback, useEffect, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { vanilla } from "~/lib/trpc-vanilla";

type User = Record<string, unknown> & { id: string; role?: string };

const AuthContext = createContext<{
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: Record<string, unknown>) => Promise<User>;
  logout: () => Promise<void>;
  switchMode: (mode: string) => Promise<void>;
  updateUser: (updates: Record<string, unknown>) => void;
} | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Hydrate full profile once session exists
  useEffect(() => {
    let alive = true;
    async function run() {
      if (status === "loading") return;
      if (!session?.user) {
        if (alive) { setUser(null); setLoading(false); }
        return;
      }
      try {
        const me = await vanilla.auth.me.query();
        if (alive) setUser((me ?? session.user) as User);
      } catch {
        if (alive) setUser(session.user as User);
      } finally {
        if (alive) setLoading(false);
      }
    }
    void run();
    return () => { alive = false; };
  }, [session, status]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await signIn("credentials", { email, password, redirect: false });
    if (!res || res.error) throw new Error(res?.error === "CredentialsSignin" ? "Invalid email or password" : (res?.error ?? "Login failed"));
    const me = (await vanilla.auth.me.query()) as User;
    setUser(me);
    return me;
  }, []);

  const register = useCallback(async (data: Record<string, unknown>) => {
    await vanilla.auth.register.mutate({
      name: String(data.name ?? ""),
      email: String(data.email ?? ""),
      password: String(data.password ?? ""),
      phone: data.phone as string | undefined,
      city: data.city as string | undefined,
      accountType: ((data.accountType as string) ?? "buyer") as "buyer" | "seller" | "both",
    });
    return login(String(data.email), String(data.password));
  }, [login]);

  const logout = useCallback(async () => {
    setUser(null);
    await signOut({ redirect: false });
    window.location.href = "/auth";
  }, []);

  const switchMode = useCallback(async (newMode: string) => {
    const updated = (await vanilla.auth.switchMode.mutate({ mode: newMode as "buyer" | "seller" })) as User;
    setUser(updated);
  }, []);

  const updateUser = useCallback((updates: Record<string, unknown>) => {
    setUser((prev) => (prev ? ({ ...prev, ...updates } as User) : prev));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, switchMode, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
