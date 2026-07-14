import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const sessionKind = req.auth?.sessionKind;
  const isAppRoute = pathname.startsWith("/app");
  const isLoginRoute = pathname === "/login";
  const isBackofficeLogin = pathname === "/backoffice/login";
  const isBackofficeRoute =
    pathname.startsWith("/backoffice") && !isBackofficeLogin;
  const isChangePassword = pathname === "/change-password";

  if (isBackofficeRoute) {
    if (!isLoggedIn || sessionKind !== "platform") {
      const loginUrl = new URL("/backoffice/login", req.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (isBackofficeLogin) {
    if (isLoggedIn && sessionKind === "platform") {
      return NextResponse.redirect(new URL("/backoffice", req.nextUrl.origin));
    }
    return NextResponse.next();
  }

  if (isChangePassword) {
    if (!isLoggedIn || sessionKind !== "erp") {
      return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
    }
    return NextResponse.next();
  }

  if (isAppRoute) {
    if (!isLoggedIn || sessionKind !== "erp") {
      const loginUrl = new URL("/login", req.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (isLoginRoute && isLoggedIn && sessionKind === "erp") {
    return NextResponse.redirect(new URL("/app", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/app/:path*",
    "/login",
    "/backoffice",
    "/backoffice/:path*",
    "/change-password",
  ],
};
