import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { db } from "@/lib/database"
import { lastfmAPI } from "@/lib/lastfm"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const topTracks = await lastfmAPI.getTopTracks()
    if (topTracks.length === 0) {
      return NextResponse.json({ error: "Failed to get challenge songs" }, { status: 500 })
    }

    const randomTrack = topTracks[Math.floor(Math.random() * Math.min(topTracks.length, 20))]
    const challengeToken = Math.random().toString(36).substr(2, 15)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    await db.createVerificationChallenge({
      user_id: session.userId,
      song_name: randomTrack.name,
      artist_name: randomTrack.artist,
      challenge_token: challengeToken,
      expires_at: expiresAt.toISOString(),
    })

    return NextResponse.json({
      songName: randomTrack.name,
      artistName: randomTrack.artist,
      challengeToken,
      expiresAt: expiresAt.toISOString(),
    })
  } catch (error) {
    console.error("Verify song error:", error)
    return NextResponse.json({ error: "Failed to create challenge" }, { status: 500 })
  }
}