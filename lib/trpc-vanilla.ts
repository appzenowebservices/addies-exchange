"use client";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import SuperJSON from "superjson";
import type { AppRouter } from "~/server/api/root";

function getBaseUrl() {
  if (typeof window !== "undefined") return window.location.origin;
  return "http://localhost:3000";
}

export const vanilla = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      transformer: SuperJSON,
      url: `${getBaseUrl()}/api/trpc`,
      headers: () => {
        const headers = new Headers();
        headers.set("x-trpc-source", "nextjs-vanilla");
        return headers;
      },
    }),
  ],
});
