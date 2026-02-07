import { connectDB } from "@/lib/db/mongo";
import User from "@/lib/db/models/User";
import argon2 from "argon2";
import EmailVerificationToken from "@/lib/db/models/EmailVerificationToken";
import { generateEmailToken, hashEmailToken } from "@/lib/auth/email-token";
import { sendEmail } from "@/lib/email/mailer";

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

    const user = await User.create({
      email,
      passwordHash,
      isEmailVerified: false,
    });

    // 🔑 Create verification token
    const emailToken = generateEmailToken();
    const emailTokenHash = await hashEmailToken(emailToken);

    await EmailVerificationToken.create({
      userId: user._id,
      tokenHash: emailTokenHash,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24h
    });

    // 🔗 Verification link
    const verifyUrl = `${process.env.APP_URL}/api/auth/verify-email?token=${emailToken}&userId=${user._id}`;

    // 📧 SEND EMAIL (THIS WAS MISSING)
    await sendEmail({
      to: user.email, // ✅ send to the user
      subject: "Verify your email",
      html: `
        <h2>Verify your email</h2>
        <p>Click the link below to verify your account:</p>
        <a href="${verifyUrl}">${verifyUrl}</a>
      `,
    });

    console.log("REGISTER EMAIL SENT TO:", user.email);

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
