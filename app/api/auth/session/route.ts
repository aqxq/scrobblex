import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { db } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "No session found" }, { status: 401 })
    }

    const user = await db.getUserById(session.userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const lastfmProfile = await db.getLastFmProfile(user.id)

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        lastfmUsername: user.lastfm_username,
        lastfmVerified: user.lastfm_verified,
        balance: user.balance,
        isAdmin: user.is_admin,
        createdAt: user.created_at,
      },
      lastfmProfile: lastfmProfile
        ? {
            username: lastfmProfile.lastfm_username,
            profileData: lastfmProfile.profile_data,
          }
        : null,
    })
  } catch (error) {
    console.error("Session check error:", error)
    return NextResponse.json({ error: "Failed to check session" }, { status: 500 })
  }
}