import { NextResponse } from "next/server"
import { lastfmAPI } from "@/lib/lastfm"

export async function POST() {
  try {
    console.log("Starting Last.fm authentication flow...")

    const authUrl = lastfmAPI.generateAuthUrl()
    console.log("Generated Last.fm auth URL:", authUrl)

    return NextResponse.json({ authUrl })
  } catch (error) {
    console.error("Error starting Last.fm auth:", error)
    return NextResponse.json({ error: "Failed to start authentication" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const authUrl = lastfmAPI.generateAuthUrl()
    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error("Error in GET auth start:", error)
    return NextResponse.json({ error: "Failed to start authentication" }, { status: 500 })
  }
}