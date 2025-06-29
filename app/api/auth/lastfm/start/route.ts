import { NextResponse } from "next/server"
import { lastfmAPI } from "@/lib/lastfm"

export async function POST() {
  try {
    console.log("Starting Last.fm authentication process...")

    if (!process.env.LASTFM_API_KEY || !process.env.LASTFM_SECRET || !process.env.LASTFM_CALLBACK_URL) {
      console.error("Missing Last.fm environment variables")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const authUrl = lastfmAPI.generateAuthUrl()
    console.log("Generated Last.fm auth URL:", authUrl)

    return NextResponse.json({ authUrl })
  } catch (error) {
    console.error("Last.fm auth start error:", error)
    return NextResponse.json({ error: "Failed to start authentication" }, { status: 500 })
  }
}

export async function GET() {
  return POST()
}
