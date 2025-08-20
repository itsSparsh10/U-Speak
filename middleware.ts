import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log('Middleware called for path:', pathname);

  // Public routes that don't require authentication
  const publicRoutes = ['/auth', '/api/auth/login', '/api/auth/register', '/api/auth/logout', '/api/auth/test-user', '/api/auth/test-model', '/api/auth/test-password'];
  
  if (publicRoutes.includes(pathname)) {
    console.log('Public route, allowing access');
    return NextResponse.next();
  }

  // For protected routes, we'll let the client-side handle authentication
  // The middleware will just pass through and let the pages handle auth checks
  console.log('Protected route, allowing access (client-side auth check)');
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
