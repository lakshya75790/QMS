import { AppType } from "@/app/api/main/[[...route]]/route";
import { hc } from "hono/client";

const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  const port = process.env.PORT || "10000";
  return `http://127.0.0.1:${port}`;
};

export const client = hc<AppType>(getBaseUrl(), {
  fetch: (input: RequestInfo | URL, init?: RequestInit) => {
    let targetUrl = input;
    if (typeof input === "string") {
      try {
        if (typeof window !== "undefined") {
          const urlObj = new URL(input, window.location.origin);
          if (urlObj.pathname.startsWith("/api/")) {
            targetUrl = `${window.location.origin}${urlObj.pathname}${urlObj.search}`;
          }
        } else {
          const baseUrl = getBaseUrl();
          const urlObj = new URL(input, baseUrl);
          if (urlObj.pathname.startsWith("/api/")) {
            targetUrl = `${baseUrl}${urlObj.pathname}${urlObj.search}`;
          }
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