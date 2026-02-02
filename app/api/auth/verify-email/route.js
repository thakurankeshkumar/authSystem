import { connectDB } from "@/lib/db/mongo";
import User from "@/lib/db/models/User";
import EmailVerificationToken from "@/lib/db/models/EmailVerificationToken";
import { verifyEmailToken } from "@/lib/auth/email-token";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const userId = searchParams.get("userId");

  if (!token || !userId) {
    return Response.json(
      { error: "Invalid verification link" },
      { status: 400 }
    );
  }

  await connectDB();

  const record = await EmailVerificationToken.findOne({
    userId,
    used: false,
    expiresAt: { $gt: new Date() },
  });

  if (!record) {
    return Response.json(
      { error: "Token expired or invalid" },
      { status: 400 }
    );
  }

  const valid = await verifyEmailToken(record.tokenHash, token);
  if (!valid) {
    return Response.json(
      { error: "Invalid token" },
      { status: 400 }
    );
  }

  // Mark email verified
  await User.findByIdAndUpdate(userId, {
    isEmailVerified: true,
  });

  // Invalidate token
  record.used = true;
  await record.save();

  return Response.json({
    message: "Email verified successfully",
  });
}
