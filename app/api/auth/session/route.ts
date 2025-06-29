import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { supabaseAdmin } from "@/lib/supabase"

const JWT_SECRET = process.env.JWT_SECRET!

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any

    const { data: user, error } = await supabaseAdmin.from("users").select("*").eq("id", decoded.userId).single()

    if (error || !user) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        displayName: user.display_name,
        lastfmUsername: user.lastfm_username,
        lastfmVerified: user.lastfm_verified,
        balance: user.balance,
        scrobbleCoins: user.scrobble_coins,
        totalScrobbles: user.total_scrobbles,
        profileImageUrl: user.profile_image_url,
        isAdmin: user.is_admin,
      },
    })
  } catch (error) {
    console.error("Session verification error:", error)
    return NextResponse.json({ user: null }, { status: 401 })
  }
}