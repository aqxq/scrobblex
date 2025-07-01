import { NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function GET() {
  try {
    const artists = await db.getAllArtists()

    return NextResponse.json({
      artists: artists.map((artist) => ({
        id: artist.id,
        symbol: artist.symbol,
        name: artist.name,
        genre: artist.genre,
        price: artist.current_price,
        change: artist.price_change,
        changePercent: artist.price_change_percent,
        volume: artist.volume,
        marketCap: artist.market_cap,
        totalScrobbles: artist.total_scrobbles,
        weeklyScrobbles: artist.weekly_scrobbles,
        imageUrl: artist.image_url,
        lastfmUrl: artist.lastfm_url,
      })),
    })
  } catch (error) {
    console.error("Error fetching artists:", error)
    return NextResponse.json({ error: "Failed to fetch artists" }, { status: 500 })
  }
}
