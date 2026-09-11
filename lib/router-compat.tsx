"use client";
// react-router-dom compat over Next.js App Router.
// Allows migrated Vite components to keep `import ... from 'react-router-dom'`
// while running inside Next.js. Prefer next/navigation + next/link in new code.

import React from "react";
import Link from "next/link";
import { useParams as useNextParams, usePathname, useRouter, useSearchParams as useNextSearchParams } from "next/navigation";

export function useNavigate() {
  const router = useRouter();
  return React.useCallback(
    (to: string | number, opts?: { replace?: boolean }) => {
      if (typeof to === "number") {
        if (to === -1) router.back();
        return;
      }
      if (opts?.replace) router.replace(to);
      else router.push(to);
    },
    [router],
  );
}

export function useParams<T extends Record<string, string> = Record<string, string>>(): T {
  try {
    return useNextParams() as T;
  } catch {
    return {} as T;
  }
}

export function useSearchParams(): [
  URLSearchParams,
  (params: Record<string, string> | URLSearchParams | string) => void,
] {
  const router = useRouter();
  const pathname = usePathname();
  let sp: URLSearchParams | null = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    sp = useNextSearchParams() as unknown as URLSearchParams | null;
  } catch {
    sp = null;
  }
  // Fallback that still supports `.get()` when prerendered without Suspense
  const params: URLSearchParams =
    sp ?? (new URLSearchParams() as unknown as URLSearchParams);
  const setParams = React.useCallback(
    (next: Record<string, string> | URLSearchParams | string) => {
      const qs =
        typeof next === "string"
          ? next.replace(/^\?/, "")
          : next instanceof URLSearchParams
            ? next.toString()
            : new URLSearchParams(next).toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    },
    [router, pathname],
  );
  return [params, setParams];
}

export function useLocation() {
  const pathname = usePathname();
  let search = "";
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const sp = useNextSearchParams();
    search = sp?.toString() ? `?${sp.toString()}` : "";
  } catch {
    search = "";
  }
  return { pathname, search };
}

type LinkProps = Omit<React.ComponentProps<typeof Link>, "className" | "href"> & {
  to?: string;
  href?: string;
  activeClassName?: string;
  className?: string | ((p: { isActive: boolean }) => string);
};

export function NavLink({ to, href, activeClassName = "active", className, end: _end, ...rest }: LinkProps & { end?: boolean }) {
  const pathname = usePathname();
  const target = (to ?? href ?? "/") as string;
  const isActive = pathname === target || (target !== "/" && pathname?.startsWith(target));
  const resolved =
    typeof className === "function" ? className({ isActive }) : `${className ?? ""} ${isActive ? activeClassName : ""}`.trim();
  return <Link href={target as never} className={resolved} {...rest} />;
}

// react-router <Link to=""> -> next/link
export function CompatLink({ to, href, className, ...rest }: LinkProps) {
  const resolved = typeof className === "function" ? className({ isActive: false }) : className;
  return <Link href={((to ?? href ?? "/") as string) as never} className={resolved} {...rest} />;
}
export { CompatLink as Link };

// <Navigate to=""> -> client redirect
export function Navigate({ to, replace }: { to: string; replace?: boolean }) {
  const router = useRouter();
  React.useEffect(() => {
    if (replace) router.replace(to);
    else router.push(to);
  }, [router, to, replace]);
  return null;
}

// Outlet is handled by Next.js layouts passing `children`; this stub keeps
// any missed import from crashing (renders nothing).
export function Outlet() {
  return null;
}

export function BrowserRouter({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
export function MemoryRouter({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
export function Routes({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
export function Route() {
  return null;
}
