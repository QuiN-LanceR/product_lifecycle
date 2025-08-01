import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const SECRET_KEY = process.env.JWT_SECRET;
const encoder = new TextEncoder();

if (!SECRET_KEY) {
  throw new Error('JWT_SECRET environment variable is required');
}

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
    if (process.env.NODE_ENV === 'development') {
      console.error("JWT verification failed:", err);
    }
    return null;
  }
}

export function generateSecretKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let result = '';
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}