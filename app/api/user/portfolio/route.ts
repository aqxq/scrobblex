import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { db } from "@/lib/database"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const positions = await db.getUserPositions(session.userId)

    return NextResponse.json({
      positions: positions.map((pos) => ({
        id: pos.id,
        artistId: pos.artist_id,
        symbol: pos.artist.symbol,
        name: pos.artist.name,
        shares: pos.shares,
        averagePrice: pos.average_price,
        totalInvested: pos.total_invested,
        currentPrice: pos.artist.current_price,
        currentValue: pos.shares * pos.artist.current_price,
        gainLoss: pos.shares * pos.artist.current_price - pos.total_invested,
        gainLossPercent:
          pos.total_invested > 0
            ? ((pos.shares * pos.artist.current_price - pos.total_invested) / pos.total_invested) * 100
            : 0,
      })),
    })
  } catch (error) {
    console.error("Error fetching portfolio:", error)
    return NextResponse.json({ error: "Failed to fetch portfolio" }, { status: 500 })
  }
}