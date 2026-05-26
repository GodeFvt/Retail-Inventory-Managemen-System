import { NextResponse } from "next/server";
import { hasAdminUser } from "@/lib/auth";

export async function GET() {
  const configured = await hasAdminUser();
  return NextResponse.json({ configured });
}
