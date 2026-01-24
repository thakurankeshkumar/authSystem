import { connectDB } from "@/lib/db/mongo";

export async function GET() {
  await connectDB();
  return Response.json({ ok: true, message: "MongoDB connected" });
}
