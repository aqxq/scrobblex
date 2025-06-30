import { NextResponse } from "next/server"

const LASTFM_API_KEY = process.env.NEXT_PUBLIC_LASTFM_API_KEY!

export async function POST() {
  try {
    if (!LASTFM_API_KEY) {
      console.error("LASTFM_API_KEY is not configured")
      return NextResponse.json({ error: "Last.fm API key not configured" }, { status: 500 })
    }

    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_LASTFM_CALLBACK_URL || "http://localhost:3000"

    const callbackUrl = `${baseUrl}/api/auth/lastfm/callback`

    const authUrl = `https://www.last.fm/api/auth/?api_key=${LASTFM_API_KEY}&cb=${encodeURIComponent(callbackUrl)}`

    console.log("Generated Last.fm auth URL:", authUrl)
    console.log("Callback URL:", callbackUrl)

    return NextResponse.json({ authUrl })
  } catch (error) {
    console.error("Error generating auth URL:", error)
    return NextResponse.json({ error: "Failed to generate auth URL" }, { status: 500 })
  }
}

export async function GET() {
  return POST()
}