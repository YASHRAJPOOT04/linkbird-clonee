import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define public routes that don't require authentication
const publicRoutes = ["/login", "/register"];

// Define protected routes that require authentication
const protectedRoutes = ["/campaigns", "/leads", "/settings"];

// Define the root dashboard route
const dashboardRoute = "/";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route)) || 
                          pathname === dashboardRoute;
  
  // Check for better-auth session cookie (Edge-compatible approach)
  const sessionCookie = request.cookies.get("better-auth.session_token");
  const hasSession = !!sessionCookie?.value;
  
  // If accessing a protected route without a session, redirect to login
  if (isProtectedRoute && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    // Add the current path as a redirect parameter
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }
  
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
  
  // If accessing root path without session, redirect to login
  if (pathname === dashboardRoute && !hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  
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
