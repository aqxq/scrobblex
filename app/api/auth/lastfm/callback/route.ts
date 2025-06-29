import { type NextRequest, NextResponse } from "next/server"
import { lastfmAPI } from "@/lib/lastfm"
import { db } from "@/lib/database"
import { signJWT, setAuthCookie } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.redirect(new URL("/login?error=no_token", request.url))
    }

    const session = await lastfmAPI.getSession(token)
    if (!session) {
      return NextResponse.redirect(new URL("/login?error=invalid_token", request.url))
    }

    const userInfo = await lastfmAPI.getUserInfo(session.name)
    if (!userInfo) {
      return NextResponse.redirect(new URL("/login?error=user_info_failed", request.url))
    }

    let user = await db.getUserByLastFm(session.name)

    if (!user) {
      user = await db.createUser({
        email: `${session.name}@lastfm.local`,
        display_name: userInfo.realname || session.name,
        lastfm_username: session.name,
        lastfm_verified: false,
        balance: 10000,
        is_admin: false,
      })
    }

    await db.createLastFmProfile({
      user_id: user.id,
      lastfm_username: session.name,
      access_token: session.key,
      profile_data: userInfo,
    })

    const jwtToken = signJWT({
      userId: user.id,
      email: user.email,
      lastfmUsername: user.lastfm_username,
      lastfmVerified: user.lastfm_verified,
      isAdmin: user.is_admin,
    })

    await setAuthCookie(jwtToken)

    return NextResponse.redirect(new URL("/", request.url))
  } catch (error) {
    console.error("Last.fm callback error:", error)
    return NextResponse.redirect(new URL("/login?error=callback_failed", request.url))
  }
}