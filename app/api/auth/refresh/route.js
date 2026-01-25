import { cookies } from "next/headers";
import { connectDB } from "@/lib/db/mongo";
import RefreshToken from "@/lib/db/models/RefreshToken";
import { verifyRefreshToken } from "@/lib/auth/refreshToken";
import { signAccessToken } from "@/lib/auth/jwt";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh_token")?.value;

    if (!refreshToken) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const tokens = await RefreshToken.find({
      revoked: false,
      expiresAt: { $gt: new Date() },
    });

    let matchedToken = null;

    for (const token of tokens) {
      if (await verifyRefreshToken(token.tokenHash, refreshToken)) {
        matchedToken = token;
        break;
      }
    }

    if (!matchedToken) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rotate: revoke old token
    matchedToken.revoked = true;
    await matchedToken.save();

    // Issue new access token
    const accessToken = signAccessToken({
      userId: matchedToken.userId,
    });

    cookieStore.set("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 15,
    });

    return Response.json({ message: "Token refreshed" });
  } catch (err) {
    console.error("REFRESH_ERROR:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
