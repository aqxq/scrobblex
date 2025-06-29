import { type NextRequest, NextResponse } from "next/server"
import { lastfmAPI } from "@/lib/lastfm"
import { db } from "@/lib/database"
import { signJWT, setAuthCookie } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    console.log("Last.fm callback received with token:", token ? token.substring(0, 10) + "..." : "null")

    if (!token) {
      console.error("No token provided in callback")
      return NextResponse.redirect(new URL("/login?error=no_token", request.url))
    }

    console.log("Attempting to get Last.fm session...")
    const session = await lastfmAPI.getSession(token)

    if (!session) {
      console.error("Failed to get Last.fm session")
      return NextResponse.redirect(new URL("/login?error=invalid_token", request.url))
    }

    console.log("Last.fm session obtained for user:", session.name)

    const userInfo = await lastfmAPI.getUserInfo(session.name)
    if (!userInfo) {
      console.error("Failed to get user info for:", session.name)
      return NextResponse.redirect(new URL("/login?error=user_info_failed", request.url))
    }

    console.log("User info obtained for:", session.name)

    let user = await db.getUserByLastFm(session.name)

    if (!user) {
      console.log("Creating new user for:", session.name)
      user = await db.createUser({
        email: `${session.name}@lastfm.local`,
        display_name: userInfo.realname || session.name,
        lastfm_username: session.name,
        lastfm_verified: false,
        balance: 10000,
        is_admin: false,
      })
    } else {
      console.log("Existing user found:", user.id)
    }

    await db.createLastFmProfile({
      user_id: user.id,
      lastfm_username: session.name,
      access_token: session.key,
      profile_data: userInfo,
    })

    console.log("Last.fm profile created/updated for user:", user.id)

    const jwtToken = signJWT({
      userId: user.id,
      email: user.email,
      lastfmUsername: user.lastfm_username,
      lastfmVerified: user.lastfm_verified,
      isAdmin: user.is_admin,
    })

    await setAuthCookie(jwtToken)

    console.log("Authentication successful, redirecting to home")
    return NextResponse.redirect(new URL("/", request.url))
  } catch (error) {
    console.error("Last.fm callback error:", error)
    return NextResponse.redirect(new URL("/login?error=callback_failed", request.url))
  }
}