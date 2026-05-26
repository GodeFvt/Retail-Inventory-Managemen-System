import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import { prisma } from "@/lib/prisma";
import { AUTH_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@/lib/auth-constants";

export interface AuthUser {
  id: number;
  email: string;
  role: "ADMIN";
}

interface SessionTokenPayload {
  sessionId: string;
  userId: number;
  role: "ADMIN";
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not set");
  }

  return new TextEncoder().encode(secret);
}

export function getSessionExpiresAt() {
  return new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
}

export async function signSessionToken(payload: SessionTokenPayload, expiresAt: Date) {
  return new SignJWT({
    sessionId: payload.sessionId,
    userId: payload.userId,
    role: payload.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(payload.userId))
    .setIssuedAt()
    .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
    .sign(getJwtSecret());
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

export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = await verifySessionToken(token).catch(() => null);
  if (!payload) return null;

  const session = await prisma.authSession.findUnique({
    where: { id: payload.sessionId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
    },
  });

  if (!session || session.expiresAt <= new Date()) {
    if (session) {
      await prisma.authSession.delete({ where: { id: session.id } }).catch(() => undefined);
    }
    return null;
  }

  if (session.userId !== payload.userId || session.user.role !== payload.role) {
    return null;
  }

  return session.user;
}

export async function createSessionCookie(user: AuthUser) {
  const expiresAt = getSessionExpiresAt();
  const session = await prisma.authSession.create({
    data: {
      userId: user.id,
      expiresAt,
    },
  });

  const token = await signSessionToken(
    {
      sessionId: session.id,
      userId: user.id,
      role: user.role,
    },
    expiresAt
  );

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (token) {
    const payload = await verifySessionToken(token).catch(() => null);
    if (payload) {
      await prisma.authSession.delete({ where: { id: payload.sessionId } }).catch(() => undefined);
    }
  }

  cookieStore.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function hasAdminUser() {
  const count = await prisma.appUser.count({
    where: { role: "ADMIN" },
  });

  return count > 0;
}
