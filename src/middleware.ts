import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest, res: NextResponse) {

  const token = req.cookies.get('access_token');
  if (!token?.value) {
      return await NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/superadmin/:path*'
  ],
};


