import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define public routes that don't require authentication
const publicRoutes = ["/login", "/register", "/campaigns", "/leads", "/settings", "/"];

// Define protected routes that require authentication
// Empty to allow all routes publicly as requested
const protectedRoutes: string[] = [];

// Define the root dashboard route
const dashboardRoute = "/";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // In development mode, allow all routes without authentication
  if (process.env.NODE_ENV === "development") {
    console.log(`Middleware (DEV): ${pathname} - allowing access`);
    return NextResponse.next();
  }
  
  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route)) || 
                          pathname === dashboardRoute;
  
  // Check for better-auth session cookie with multiple possible names
  // Newer Better Auth versions may use different cookie names or prefixes
  const sessionCookie = request.cookies.get("better-auth.session_token") ||
                       request.cookies.get("better-auth.session-token") ||
                       request.cookies.get("session_token") ||
                       request.cookies.get("auth-session");
  const hasSession = !!sessionCookie?.value;
  
  // Debug logging for production
  console.log(`Middleware: ${pathname}, hasSession: ${hasSession}, cookies:`, 
    request.cookies.getAll().map(c => c.name));
  
  // No protected routes for now
  
  // If accessing a public route with a session, redirect to dashboard
  if (isPublicRoute && hasSession) {
    // Check if there's a redirect parameter
    const redirectParam = request.nextUrl.searchParams.get("redirect");
    if (redirectParam) {
      return NextResponse.redirect(new URL(redirectParam, request.url));
    }
    return NextResponse.redirect(new URL("/campaigns", request.url));
  }
  
  // If accessing root path, redirect to campaigns
  if (pathname === dashboardRoute && hasSession) {
    return NextResponse.redirect(new URL("/campaigns", request.url));
  }
  
  // Allow root path without session
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
