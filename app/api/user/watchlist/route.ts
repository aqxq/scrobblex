import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { db } from "@/lib/database"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const watchlist = await db.getUserWatchlist(session.userId)

    return NextResponse.json({
      watchlist: watchlist.map((item) => ({
        id: item.id,
        artistId: item.artist_id,
        symbol: item.artist.symbol,
        name: item.artist.name,
        genre: item.artist.genre,
        price: item.artist.current_price,
        change: item.artist.price_change,
        changePercent: item.artist.price_change_percent,
        volume: item.artist.volume,
      })),
    })
  } catch (error) {
    console.error("Error fetching watchlist:", error)
    return NextResponse.json({ error: "Failed to fetch watchlist" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { artistId } = await request.json()

    await db.addToWatchlist(session.userId, artistId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error adding to watchlist:", error)
    return NextResponse.json({ error: "Failed to add to watchlist" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { artistId } = await request.json()

    await db.removeFromWatchlist(session.userId, artistId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error removing from watchlist:", error)
    return NextResponse.json({ error: "Failed to remove from watchlist" }, { status: 500 })
  }
}