import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { supabaseAdmin } from "@/lib/supabase"

const JWT_SECRET = process.env.JWT_SECRET!

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", decoded.userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { data: positions, error: positionsError } = await supabaseAdmin
      .from("positions")
      .select(`
        *,
        artist:artists(*)
      `)
      .eq("user_id", user.id)

    if (positionsError) {
      console.error("Error fetching positions:", positionsError)
      return NextResponse.json({ error: "Failed to fetch portfolio" }, { status: 500 })
    }

    const totalValue =
      positions?.reduce((sum, position) => {
        return sum + position.shares * position.artist.current_price
      }, 0) || 0

    const totalInvested =
      positions?.reduce((sum, position) => {
        return sum + position.total_invested
      }, 0) || 0

    const gainLoss = totalValue - totalInvested
    const gainLossPercent = totalInvested > 0 ? (gainLoss / totalInvested) * 100 : 0

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
      portfolio: {
        totalValue,
        totalInvested,
        gainLoss,
        gainLossPercent,
        cashBalance: user.balance,
        totalAssets: totalValue + user.balance,
        positions:
          positions?.map((position) => ({
            artistName: position.artist.name,
            shares: position.shares,
            averagePrice: position.average_price,
            currentPrice: position.artist.current_price,
            totalValue: position.shares * position.artist.current_price,
            gainLoss: position.shares * position.artist.current_price - position.total_invested,
            gainLossPercent:
              position.total_invested > 0
                ? ((position.shares * position.artist.current_price - position.total_invested) /
                    position.total_invested) *
                  100
                : 0,
            artistImage: position.artist.image_url,
          })) || [],
      },
    })
  } catch (error) {
    console.error("Portfolio API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
