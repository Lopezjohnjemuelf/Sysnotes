import { NextResponse } from "next/server";
import { auth } from "./lib/auth";

export default auth((request) => {
  if (request.nextUrl.pathname === "/admin") {
    return NextResponse.redirect(new URL("/admin/releases", request.nextUrl));
  }

  if (!request.auth) {
    const loginUrl = new URL("/login", request.nextUrl);
    loginUrl.searchParams.set(
      "callbackUrl",
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  // Only admin routes are protected; public auth routes like /login and /register stay outside the matcher.
  matcher: ["/admin/:path*"],
};
