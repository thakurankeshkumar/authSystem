import { connectDB } from "@/lib/db/mongo";
import User from "@/lib/db/models/User";
import argon2 from "argon2";
import EmailVerificationToken from "@/lib/db/models/EmailVerificationToken";
import { generateEmailToken, hashEmailToken } from "@/lib/auth/email-token";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return Response.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return Response.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    await connectDB();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return Response.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await argon2.hash(password);

    // ✅ FIX: capture user
    const user = await User.create({
      email,
      passwordHash,
      isEmailVerified: false,
    });

    const emailToken = generateEmailToken();
    const emailTokenHash = await hashEmailToken(emailToken);

    await EmailVerificationToken.create({
      userId: user._id,
      tokenHash: emailTokenHash,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24h
    });

    console.log(
      `Verify email: http://localhost:3000/api/auth/verify-email?token=${emailToken}&userId=${user._id}`
    );

    return Response.json(
      { message: "User registered successfully. Please verify your email." },
      { status: 201 }
    );
  } catch (error) {
    console.error("REGISTER_ERROR:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
