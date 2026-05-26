import argon2 from "argon2";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSessionCookie, hasAdminUser } from "@/lib/auth";

const setupSchema = z.object({
  email: z.string().email().max(191).transform((value) => value.toLowerCase().trim()),
  password: z.string().min(8).max(128),
});

export async function POST(request: Request) {
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
