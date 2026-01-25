import crypto from "crypto";
import argon2 from "argon2";

export function generateRefreshToken() {
  return crypto.randomBytes(64).toString("hex");
}

export async function hashRefreshToken(token) {
  return argon2.hash(token);
}

export async function verifyRefreshToken(hash, token) {
  return argon2.verify(hash, token);
}
