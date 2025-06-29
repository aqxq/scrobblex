import { type NextRequest, NextResponse } from "next/server"
import { verifyJWT } from "@/lib/auth"
import { db } from "@/lib/database"
import { lastfmAPI } from "@/lib/lastfm"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const payload = verifyJWT(token)
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const user = await db.getUserById(payload.userId)
    if (!user || !user.lastfm_username) {
      return NextResponse.json({ error: "User not found or no Last.fm account" }, { status: 404 })
    }

    const [userInfo, recentTracks, topArtists] = await Promise.all([
      lastfmAPI.getUserInfo(user.lastfm_username),
      lastfmAPI.getRecentTracks(user.lastfm_username, 10),
      lastfmAPI.getTopArtists(user.lastfm_username, 10),
    ])

    return NextResponse.json({
      username: user.lastfm_username,
      userInfo,
      recentTracks,
      topArtists,
      stats: {
        totalScrobbles: userInfo?.playcount || 0,
        memberSince: userInfo?.registered?.unixtime
          ? new Date(Number.parseInt(userInfo.registered.unixtime) * 1000).toLocaleDateString()
          : "Unknown",
      },
    })
  } catch (error) {
    console.error("Error fetching Last.fm data:", error)
    return NextResponse.json({ error: "Failed to fetch Last.fm data" }, { status: 500 })
  }
}
