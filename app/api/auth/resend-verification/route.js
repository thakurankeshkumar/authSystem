import { connectDB } from "@/lib/db/mongo";
import User from "@/lib/db/models/User";
import EmailVerificationToken from "@/lib/db/models/EmailVerificationToken";
import {
  generateEmailToken,
  hashEmailToken,
} from "@/lib/auth/email-token";

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return Response.json(
        { message: "If the email exists, a verification link was sent." },
        { status: 200 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email });

    // 🔐 Do NOT reveal user existence
    if (!user) {
      return Response.json(
        { message: "If the email exists, a verification link was sent." },
        { status: 200 }
      );
    }

    // Already verified
    if (user.isEmailVerified) {
      return Response.json(
        { message: "Email already verified." },
        { status: 200 }
      );
    }

    // ❌ Invalidate old tokens
    await EmailVerificationToken.updateMany(
      { userId: user._id, used: false },
      { used: true }
    );

    // ✅ Create new token
    const emailToken = generateEmailToken();
    const emailTokenHash = await hashEmailToken(emailToken);

    await EmailVerificationToken.create({
      userId: user._id,
      tokenHash: emailTokenHash,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24h
    });

    // TEMP: log link (replace with real email later)
    console.log(
      `Resend verify email: http://localhost:3000/api/auth/verify-email?token=${emailToken}&userId=${user._id}`
    );

    return Response.json({
      message: "If the email exists, a verification link was sent.",
    });
  } catch (error) {
    console.error("RESEND_VERIFICATION_ERROR:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
