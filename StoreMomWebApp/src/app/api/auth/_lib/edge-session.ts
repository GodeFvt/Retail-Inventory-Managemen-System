import { jwtVerify } from "jose";

export interface SessionTokenPayload {
  sessionId: string;
  userId: number;
  role: "ADMIN";
}

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not set");
  }

  return new TextEncoder().encode(secret);
}

export async function verifySessionToken(token: string) {
  const { payload } = await jwtVerify(token, getJwtSecret());

  if (
    typeof payload.sessionId !== "string" ||
    typeof payload.userId !== "number" ||
    payload.role !== "ADMIN"
  ) {
    return null;
  }

  return {
    sessionId: payload.sessionId,
    userId: payload.userId,
    role: payload.role,
  } satisfies SessionTokenPayload;
}
