import { connectDB } from "@/lib/db/mongo";
import User from "@/lib/db/models/User";
import argon2 from "argon2";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    // Basic validation
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

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return Response.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await argon2.hash(password);

    // Create user
    await User.create({
      email,
      passwordHash,
    });

    return Response.json(
      { message: "User registered successfully" },
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
