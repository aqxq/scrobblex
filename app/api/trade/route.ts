import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { db } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { artistName, shares, price, type } = await request.json()

    if (!artistName || !shares || !price || !type) {
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

      const existingPosition = await db.getPosition(session.userId, artistName)
      if (existingPosition) {
        const newShares = existingPosition.shares + shares
        const newAveragePrice = (existingPosition.shares * existingPosition.average_price + total) / newShares
        await db.updatePosition(session.userId, artistName, newShares, newAveragePrice)
      } else {
        await db.updatePosition(session.userId, artistName, shares, price)
      }
    } else {
      const position = await db.getPosition(session.userId, artistName)
      if (!position || position.shares < shares) {
        return NextResponse.json({ error: "Insufficient shares" }, { status: 400 })
      }

      await db.updateUser(session.userId, { balance: user.balance + total })

      const newShares = position.shares - shares
      if (newShares === 0) {
        await db.updatePosition(session.userId, artistName, 0, 0)
      } else {
        await db.updatePosition(session.userId, artistName, newShares, position.average_price)
      }
    }

    await db.createTransaction({
      user_id: session.userId,
      artist_name: artistName,
      type,
      shares,
      price,
      total,
    })

    return NextResponse.json({
      success: true,
      message: `Successfully ${type === "buy" ? "bought" : "sold"} ${shares} shares of ${artistName}`,
    })
  } catch (error) {
    console.error("Trade error:", error)
    return NextResponse.json({ error: "Failed to execute trade" }, { status: 500 })
  }
}