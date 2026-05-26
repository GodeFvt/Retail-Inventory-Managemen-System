import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { AUTH_COOKIE_NAME } from "@/lib/auth-constants";

const PUBLIC_PATHS = ["/login", "/setup"];

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not set");
  }

  return new TextEncoder().encode(secret);
}

async function hasValidToken(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return false;

  try {
    await jwtVerify(token, getJwtSecret());
    return true;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthApi = pathname.startsWith("/api/auth");
  const isApi = pathname.startsWith("/api");
  const isPublicPage = PUBLIC_PATHS.includes(pathname);

  if (isAuthApi) {
    return NextResponse.next();
  }

  const authenticated = await hasValidToken(request);

  if (isApi && !authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isPublicPage && authenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!isPublicPage && !isApi && !authenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
