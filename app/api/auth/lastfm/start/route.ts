import { NextResponse } from "next/server"
import { lastfmAPI } from "@/lib/lastfm"

export async function POST() {
  try {
    const authUrl = lastfmAPI.generateAuthUrl()
    return NextResponse.json({ authUrl })
  } catch (error) {
    console.error("Last.fm auth start error:", error)
    return NextResponse.json({ error: "Failed to start authentication" }, { status: 500 })
  }
}