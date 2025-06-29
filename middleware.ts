import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyJWT } from "@/lib/auth"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const publicRoutes = ["/login", "/api/auth/lastfm/start", "/api/auth/lastfm/callback"]

  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  const token = request.cookies.get("auth-token")?.value

  if (!token && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (token) {
    const payload = verifyJWT(token)

    if (!payload && pathname !== "/login") {
      const response = NextResponse.redirect(new URL("/login", request.url))
      response.cookies.delete("auth-token")
      return response
    }

    if (payload && pathname === "/login") {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
