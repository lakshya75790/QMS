/**
 * Resolves the public base URL dynamically:
 * 1. In browser: window.location.origin (always matches current production/local domain).
 * 2. On server: process.env.NEXT_PUBLIC_URL or process.env.RENDER_EXTERNAL_URL or fallback.
 */
export const getPublicBaseUrl = (): string => {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  if (
    process.env.NEXT_PUBLIC_URL &&
    !process.env.NEXT_PUBLIC_URL.includes("localhost")
  ) {
    return process.env.NEXT_PUBLIC_URL.replace(/\/$/, "");
  }
  if (process.env.RENDER_EXTERNAL_URL) {
    return process.env.RENDER_EXTERNAL_URL.replace(/\/$/, "");
  }
  if (process.env.NEXT_PUBLIC_URL) {
    return process.env.NEXT_PUBLIC_URL.replace(/\/$/, "");
  }
  return "http://localhost:3000";
};

/**
 * Ensures a path or URL is resolved to a complete, accurate absolute URL.
 * Automatically converts relative paths and normalizes outdated localhost origins
 * to the actual active domain when running in the browser.
 */
export const getAbsoluteUrl = (pathOrUrl: string): string => {
  if (!pathOrUrl) return "";

  // 1. Browser runtime: dynamically resolve using the active origin
  if (typeof window !== "undefined" && window.location?.origin) {
    try {
      if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
        const parsed = new URL(pathOrUrl);
        // If the URL has localhost/127.0.0.1 but current browser is on production/staging, swap to current origin
        if (
          (parsed.hostname === "localhost" ||
            parsed.hostname === "127.0.0.1") &&
          window.location.hostname !== "localhost" &&
          window.location.hostname !== "127.0.0.1"
        ) {
          return `${window.location.origin}${parsed.pathname}${parsed.search}${parsed.hash}`;
        }
        return pathOrUrl;
      }
      const cleanPath = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
      return `${window.location.origin}${cleanPath}`;
    } catch {
      return pathOrUrl;
    }
  }

  // 2. Server-side runtime
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    if (
      (pathOrUrl.includes("localhost") || pathOrUrl.includes("127.0.0.1")) &&
      process.env.RENDER_EXTERNAL_URL
    ) {
      try {
        const parsed = new URL(pathOrUrl);
        return `${process.env.RENDER_EXTERNAL_URL.replace(/\/$/, "")}${parsed.pathname}${parsed.search}${parsed.hash}`;
      } catch {
        // fallback
      }
    }
    return pathOrUrl;
  }

  const baseUrl = getPublicBaseUrl();
  const cleanPath = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${baseUrl}${cleanPath}`;
};
