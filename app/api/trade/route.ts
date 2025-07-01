import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { db } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { artistId, shares, price, type } = await request.json()

    if (!artistId || !shares || !price || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (type !== "buy" && type !== "sell") {
      return NextResponse.json({ error: "Invalid trade type" }, { status: 400 })
    }

    const user = await db.getUserById(session.userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const total = shares * price

    if (type === "buy") {
      if (user.balance < total) {
        return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })
      }

      await db.updateUser(session.userId, { balance: user.balance - total })

      const existingPosition = await db.getPosition(session.userId, artistId)
      if (existingPosition) {
        const newShares = existingPosition.shares + shares
        const newTotalInvested = existingPosition.total_invested + total
        const newAveragePrice = newTotalInvested / newShares
        await db.updatePosition(session.userId, artistId, newShares, newAveragePrice, newTotalInvested)
      } else {
        await db.updatePosition(session.userId, artistId, shares, price, total)
      }
    } else {
      const position = await db.getPosition(session.userId, artistId)
      if (!position || position.shares < shares) {
        return NextResponse.json({ error: "Insufficient shares" }, { status: 400 })
      }

      await db.updateUser(session.userId, { balance: user.balance + total })

      const newShares = position.shares - shares
      const newTotalInvested = Math.max(0, position.total_invested - shares * position.average_price)

      if (newShares === 0) {
        await db.updatePosition(session.userId, artistId, 0, 0, 0)
      } else {
        await db.updatePosition(session.userId, artistId, newShares, position.average_price, newTotalInvested)
      }
    }

    await db.createTransaction({
      user_id: session.userId,
      artist_id: artistId,
      type,
      shares,
      price,
      total,
    })

    const artist = await db.getArtistBySymbol(artistId)
    return NextResponse.json({
      success: true,
      message: `Successfully ${type === "buy" ? "bought" : "sold"} ${shares} shares of ${artist?.name || artistId}`,
    })
  } catch (error) {
    console.error("Trade error:", error)
    return NextResponse.json({ error: "Failed to execute trade" }, { status: 500 })
  }
}