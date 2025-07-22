import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const SECRET_KEY = process.env.NEXT_PUBLIC_JWT_SECRET!;
const encoder = new TextEncoder();

export async function generateToken(payload: JWTPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1d")
    .sign(encoder.encode(SECRET_KEY));
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, encoder.encode(SECRET_KEY));
    return payload;
  } catch (err) {
    console.error("JWT verification failed:", err);
    return null;
  }
}