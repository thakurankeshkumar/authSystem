import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },

    passwordHash: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["user", "admin", "superadmin"],
      default: "user",
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    lastLoginAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
