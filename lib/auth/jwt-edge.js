import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_ACCESS_SECRET
);

export async function verifyAccessTokenEdge(token) {
  return jwtVerify(token, secret);
}