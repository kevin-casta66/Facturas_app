import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.SUPABASE_SECRET_KEY || "default-secret-key-32-chars-long-or-more",
);

export async function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get("session")?.value;
  const { pathname } = request.nextUrl;

  const isLoginRoute = pathname === "/login";
  const isApiRoute = pathname.startsWith("/api/");
  const isPublicFile =
    pathname.startsWith("/_next/") ||
    pathname.includes(".") ||
    pathname === "favicon.ico";

  if (isApiRoute || isPublicFile) {
    return NextResponse.next();
  }

  let session = null;
  if (sessionCookie) {
    try {
      const { payload } = await jwtVerify(sessionCookie, JWT_SECRET, {
        algorithms: ["HS256"],
      });
      session = payload;
    } catch {}
  }

  if (!session && !isLoginRoute) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (session && isLoginRoute) {
    const homeUrl = new URL("/", request.url);
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
