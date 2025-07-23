import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/utils/auth";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  let user = null;

  if (token) {
    try {
      user = await verifyToken(token);
    } catch (err) {
      console.log(err);
      user = null;
    }
  }

  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin") && !user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname.startsWith("/login") && user) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
