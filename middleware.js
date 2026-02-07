import { NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth/jwt";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  const publicPaths = [
    "/login",
    "/register",
    "/verify-email",
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/verify-email",
    "/api/auth/resend-verification",
    "/api/auth/logout",
  ];

  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const token = request.cookies.get("access_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = verifyAccessToken(token);

    // 🔴 NEW: enforce email verification
    if (!payload.isEmailVerified) {
      return NextResponse.json(
        { error: "Email not verified" },
        { status: 403 }
      );
    }

    return NextResponse.next();
  } catch {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 }
    );
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/api/protected/:path*",
  ],
};
