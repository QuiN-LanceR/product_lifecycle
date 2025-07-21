import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Cek apakah user sudah login
  let isAuthenticated = false;
  if (token) {
    try {
      jwt.verify(token, process.env.JWT_SECRET!);
      isAuthenticated = true;
    } catch (error) {
      // Token tidak valid, hapus cookie
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }
  }

  // Jika user belum login dan mencoba akses halaman yang dilindungi
  if (!isAuthenticated && pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Jika user sudah login dan mencoba akses halaman login
  if (isAuthenticated && pathname === '/login') {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

// Konfigurasi matcher untuk menentukan route mana yang akan diproses middleware
export const config = {
  matcher: [
    '/admin/:path*',
    '/login'
  ]
};