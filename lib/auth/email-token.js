import crypto from "crypto";
import argon2 from "argon2";

export function generateEmailToken() {
  return crypto.randomBytes(32).toString("hex");
}

export async function hashEmailToken(token) {
  return argon2.hash(token);
}

export async function verifyEmailToken(hash, token) {
  return argon2.verify(hash, token);
}
