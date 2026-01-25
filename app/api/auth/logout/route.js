import { cookies } from "next/headers";
import { connectDB } from "@/lib/db/mongo";
import RefreshToken from "@/lib/db/models/RefreshToken";
import { verifyRefreshToken } from "@/lib/auth/refreshToken";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh_token")?.value;

    if (refreshToken) {
      await connectDB();

      const tokens = await RefreshToken.find({
        revoked: false,
      });

      for (const token of tokens) {
        if (await verifyRefreshToken(token.tokenHash, refreshToken)) {
          token.revoked = true;
          await token.save();
          break;
        }
      }
    }

    // Clear cookies
    cookieStore.set("access_token", "", { maxAge: 0, path: "/" });
    cookieStore.set("refresh_token", "", {
      maxAge: 0,
      path: "/api/auth/refresh",
    });

    return Response.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("LOGOUT_ERROR:", err);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
