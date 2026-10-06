import { AppType } from "@/app/api/main/[[...route]]/route";
import { hc } from "hono/client";

const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
};

export const client = hc<AppType>(getBaseUrl(), {
  fetch: (input: RequestInfo | URL, init?: RequestInit) => {
    let targetUrl = input;
    if (typeof window !== "undefined" && typeof input === "string") {
      try {
        const urlObj = new URL(input, window.location.origin);
        if (urlObj.pathname.startsWith("/api/")) {
          targetUrl = `${window.location.origin}${urlObj.pathname}${urlObj.search}`;
        }
      } catch {}
    }
    return fetch(targetUrl, {
      ...init,
      credentials: "include",
    });
  },
});

export type AppTypes = AppType;