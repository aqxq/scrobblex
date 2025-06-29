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

    const { challengeToken } = await request.json()

    const challenge = await db.getVerificationChallenge(challengeToken)
    if (!challenge) {
      return NextResponse.json({ error: "Invalid challenge token" }, { status: 400 })
    }

    if (new Date(challenge.expires_at) < new Date()) {
      await db.deleteVerificationChallenge(challengeToken)
      return NextResponse.json({ error: "Challenge expired" }, { status: 400 })
    }

    const user = await db.getUserById(session.userId)
    if (!user?.lastfm_username) {
      return NextResponse.json({ error: "No Last.fm username" }, { status: 400 })
    }

    const recentTracks = await lastfmAPI.getRecentTracks(user.lastfm_username, 5)

    const challengeTime = new Date(challenge.expires_at).getTime() - 10 * 60 * 1000
    const foundTrack = recentTracks.find((track) => {
      const trackTime = track.date ? Number.parseInt(track.date.uts) * 1000 : Date.now()
      return (
        track.name.toLowerCase().includes(challenge.song_name.toLowerCase()) &&
        track.artist["#text"].toLowerCase().includes(challenge.artist_name.toLowerCase()) &&
        trackTime >= challengeTime
      )
    })

    if (foundTrack) {
      await db.updateUser(session.userId, { lastfm_verified: true })
      await db.deleteVerificationChallenge(challengeToken)

      return NextResponse.json({
        success: true,
        message: "Verification successful!",
      })
    } else {
      return NextResponse.json({
        success: false,
        message: "Challenge song not found in recent tracks. Please try playing it again.",
      })
    }
  } catch (error) {
    console.error("Check scrobble error:", error)
    return NextResponse.json({ error: "Failed to check scrobble" }, { status: 500 })
  }
}