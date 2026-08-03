// middleware.js
import { NextResponse } from 'next/server';

export function proxy(request) {
  const path = request.nextUrl.pathname;

  if (path.startsWith('/admin')) {
    const token = request.cookies.get('token')?.value;

    // Direct unauthenticated users to login
    if (!token) {
      return NextResponse.redirect(new URL('/auth', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};