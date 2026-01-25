import { NextResponse } from "next/server";
import { verifyAccessTokenEdge } from "@/lib/auth/jwt-edge";

export async function middleware(request) {
    const { pathname } = request.nextUrl;

    const publicPaths = [
        "/login",
        "/register",
        "/api/auth/login",
        "/api/auth/register",
        "/api/auth/refresh",
        "/api/auth/logout",
    ];

    if (publicPaths.some((path) => pathname.startsWith(path))) {
        return NextResponse.next();
    }

    const token = request.cookies.get("access_token")?.value;

    if (!token) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const { payload } = await verifyAccessTokenEdge(token);
        const userRole = payload.role;

        const isAdminRoute =
            pathname.startsWith("/admin") ||
            pathname.startsWith("/api/protected/admin");

        if (isAdminRoute && userRole !== "admin") {
            return NextResponse.json(
                { error: "Forbidden: Admins only" },
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
