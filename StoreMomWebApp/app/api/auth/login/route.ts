import argon2 from "argon2";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSessionCookie } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email().max(191).transform((value) => value.toLowerCase().trim()),
  password: z.string().min(1).max(128),
});

export async function POST(request: Request) {
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
}
