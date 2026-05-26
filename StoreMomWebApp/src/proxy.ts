import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, AUTH_PUBLIC_PATHS } from "@/app/api/auth/_lib/constants";
import { verifySessionToken } from "@/app/api/auth/_lib/edge-session";

async function hasValidToken(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return false;

  try {
    return Boolean(await verifySessionToken(token));
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthApi = pathname.startsWith("/api/auth");
  const isApi = pathname.startsWith("/api");
  const isPublicPage = AUTH_PUBLIC_PATHS.includes(pathname);

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
