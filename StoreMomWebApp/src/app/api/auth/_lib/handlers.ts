import argon2 from "argon2";
import { NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";
import { createSessionCookie, clearSessionCookie, getCurrentUser, hasAdminUser } from "@/app/api/auth/_lib/session";
import { loginSchema, setupSchema } from "@/app/api/auth/_lib/validation";

export async function getAuthStatus() {
  const configured = await hasAdminUser();
  return NextResponse.json({ configured });
}

export async function setupAdmin(request: Request) {
  const configured = await hasAdminUser();
  if (configured) {
    return NextResponse.json({ error: "App is already configured" }, { status: 409 });
  }

  const body = await request.json().catch(() => null);
  const parsed = setupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid setup data" }, { status: 400 });
  }

  const passwordHash = await argon2.hash(parsed.data.password, {
    type: argon2.argon2id,
  });

  const user = await prisma.appUser.create({
    data: {
      email: parsed.data.email,
      passwordHash,
      role: "ADMIN",
    },
    select: {
      id: true,
      email: true,
      role: true,
    },
  });

  await createSessionCookie(user);

  return NextResponse.json({ user });
}

export async function login(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 400 });
    }

    const user = await prisma.appUser.findUnique({
      where: { email: parsed.data.email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const validPassword = await argon2.verify(user.passwordHash, parsed.data.password);
    if (!validPassword) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    await createSessionCookie({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login failed", error);
    return NextResponse.json({ error: "Login service is not configured correctly" }, { status: 500 });
  }
}

export async function logout() {
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}

export async function getMe() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({ user });
}
