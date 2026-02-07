import { connectDB } from "@/lib/db/mongo";
import User from "@/lib/db/models/User";
import RefreshToken from "@/lib/db/models/RefreshToken";
import argon2 from "argon2";
import { signAccessToken } from "@/lib/auth/jwt";
import { generateRefreshToken, hashRefreshToken } from "@/lib/auth/refreshToken";
import { cookies } from "next/headers";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return Response.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email });
    if (!user) {
      return Response.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    if (!user.isEmailVerified) {
      return Response.json(
        { error: "Please verify your email" },
        { status: 403 }
      );
    }


    const isValid = await argon2.verify(user.passwordHash, password);
    if (!isValid) {
      return Response.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // 🔐 Create access token
    const accessToken = signAccessToken({
      userId: user._id,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
    });


    // 🔁 Create refresh token
    const refreshToken = generateRefreshToken();
    const refreshTokenHash = await hashRefreshToken(refreshToken);

    await RefreshToken.create({
      userId: user._id,
      tokenHash: refreshTokenHash,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
    });

    // ✅ REQUIRED in Next.js 16
    const cookieStore = await cookies();

    // Set access token cookie
    cookieStore.set("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 15, // 15 minutes
    });

    // Set refresh token cookie
    cookieStore.set("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/auth/refresh",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return Response.json({ message: "Login successful" });
  } catch (error) {
    console.error("LOGIN_ERROR:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}