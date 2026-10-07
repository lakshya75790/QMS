/**
 * Resolves the public base URL dynamically across any deployment:
 * 1. In browser: window.location.origin (always matches the active domain on AWS, Render, or localhost).
 * 2. On server: environment configuration variable (NEXT_PUBLIC_URL) or default localhost.
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
  if (process.env.NEXT_PUBLIC_URL) {
    return process.env.NEXT_PUBLIC_URL.replace(/\/$/, "");
  }
  return "http://localhost:3000";
};

/**
 * Resolves any path or URL into a complete absolute URL:
 * - In the browser: Always uses active window.location.origin (purely deployment-agnostic).
 * - On the server: Uses server-side environment base URL (NEXT_PUBLIC_URL).
 */
export const getAbsoluteUrl = (pathOrUrl: string): string => {
  if (!pathOrUrl) return "";

  // 1. Browser runtime: dynamically resolve using the active origin
  if (typeof window !== "undefined" && window.location?.origin) {
    try {
      if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
        const parsed = new URL(pathOrUrl);
        // If the URL contains localhost/127.0.0.1 but the browser is on a remote domain, use the current active origin
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
    return pathOrUrl;
  }

  const baseUrl = getPublicBaseUrl();
  const cleanPath = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${baseUrl}${cleanPath}`;
};
