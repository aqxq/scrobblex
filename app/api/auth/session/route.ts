import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    const { data: user, error } = await supabaseAdmin.from("users").select("*").eq("id", session.userId).single()

    if (error || !user) {
      console.error("Error fetching user:", error)
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
    console.error("Session check error:", error)
    return NextResponse.json({ user: null }, { status: 500 })
  }
}
