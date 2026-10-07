import {
  authRoutes,
  homeUrl,
  publicGroupRoute,
  publicRoutes,
} from "./config/routesConfig";
import NextAuth from "next-auth";
import { NextResponse } from "next/server";

const { auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  session: { strategy: "jwt" },
  providers: [],
});

export default auth((req) => {
  const { nextUrl } = req;

  // Check if the user is logged in
  const isLoggedIn = !!req.auth;

  // Route type checks
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  // Check if the route matches public group routes
  const isPublicGroupRoute = publicGroupRoute.some((route) => {
    const routeRegex = new RegExp(`^${route}(\\/|$)`); // Match "/p" or "/p/...".
    return routeRegex.test(nextUrl.pathname);
  });

  if (isPublicGroupRoute) {
    return NextResponse.next();
  }

  // Handle authenticated routes
  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL(homeUrl, nextUrl));
    }
    return NextResponse.next();
  }

  // Redirect unauthenticated users trying to access protected routes
  if (!isLoggedIn && !isPublicRoute) {
    let callbackUrl = nextUrl.pathname;
    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }
    const encodedCallbackUrl = encodeURIComponent(callbackUrl);
    return NextResponse.redirect(
      new URL(`/auth/login?callbackUrl=${encodedCallbackUrl}`, nextUrl),
    );
  }

  // Allow other requests to proceed
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
