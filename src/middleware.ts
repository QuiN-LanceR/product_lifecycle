import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/utils/auth";
// Import env validator untuk memastikan environment variables valid
import "@/lib/env";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  let user = null;

  if (token) {
    try {
      user = await verifyToken(token);
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Token verification failed:', err);
      }
      user = null;
    }
  }

  const { pathname } = req.nextUrl;

  // Jika mengakses halaman admin tanpa login, redirect ke login
  if (pathname.startsWith("/admin") && !user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Jika mengakses login dan sudah login, redirect ke halaman terakhir atau admin
  if (pathname.startsWith("/login") && user) {
    // Ambil halaman terakhir dari cookie atau header referer
    const lastPage = req.cookies.get("lastAdminPage")?.value;
    const referer = req.headers.get("referer");
    
    let redirectUrl = "/admin"; // default
    
    // Prioritas: cookie lastAdminPage > referer yang valid
    if (lastPage && lastPage.startsWith("/admin")) {
      redirectUrl = lastPage;
    } else if (referer) {
      const refererUrl = new URL(referer);
      if (refererUrl.pathname.startsWith("/admin")) {
        redirectUrl = refererUrl.pathname;
      }
    }
    
    return NextResponse.redirect(new URL(redirectUrl, req.url));
  }

  // Simpan halaman admin yang diakses ke cookie untuk referensi nanti
  if (pathname.startsWith("/admin") && user) {
    const response = NextResponse.next();
    response.cookies.set("lastAdminPage", pathname, {
      maxAge: 60 * 60 * 24, // 24 jam
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax"
    });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};