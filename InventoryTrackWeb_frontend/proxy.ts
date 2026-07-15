import { NextRequest, NextResponse } from "next/server";

// Routes currently live under `app/pages/...`, which exposes them at `/pages/*`.
// Rewrite clean URLs like `/login` and `/dashboard` to the existing route tree.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/pages/") ||
    pathname === "/pages" ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = `/pages${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next/|api/).*)"],
};
