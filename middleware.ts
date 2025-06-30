import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get session cookie
  const sessionCookie = request.cookies.get("agilenesia_session")

  // If no session and not on login page, redirect to login
  if (!sessionCookie && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // If has session and on login page, redirect to home
  if (sessionCookie && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
