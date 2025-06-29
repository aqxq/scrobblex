import { type NextRequest, NextResponse } from "next/server"
import { lastfmAPI } from "@/lib/lastfm"

export async function GET(request: NextRequest) {
  try {
    const callbackUrl =
      process.env.NEXT_PUBLIC_LASTFM_CALLBACK_URL || `${request.nextUrl.origin}/api/auth/lastfm/callback`

    console.log("Starting Last.fm auth with callback:", callbackUrl)

    const authUrl = await lastfmAPI.getAuthUrl(callbackUrl)

    console.log("Generated Last.fm auth URL:", authUrl)
    return NextResponse.json({ authUrl })
  } catch (error) {
    console.error("Error starting Last.fm auth:", error)
    return NextResponse.json({ error: "Failed to start authentication" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
}