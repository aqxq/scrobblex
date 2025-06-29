import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { db } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await db.getUserById(session.userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const positions = await db.getUserPositions(session.userId)
    const transactions = await db.getUserTransactions(session.userId)

    const portfolioValue = positions.reduce((total, position) => {
      return total + position.shares * position.current_price
    }, 0)

    return NextResponse.json({
      user: {
        id: user.id,
        displayName: user.display_name,
        lastfmUsername: user.lastfm_username,
        lastfmVerified: user.lastfm_verified,
        balance: user.balance,
        isAdmin: user.is_admin,
      },
      portfolio: {
        totalValue: portfolioValue,
        cashBalance: user.balance,
        totalAssets: portfolioValue + user.balance,
        positions: positions.map((position) => ({
          artistName: position.artist_name,
          shares: position.shares,
          averagePrice: position.average_price,
          currentPrice: position.current_price,
          totalValue: position.shares * position.current_price,
          gainLoss: (position.current_price - position.average_price) * position.shares,
          gainLossPercent: ((position.current_price - position.average_price) / position.average_price) * 100,
        })),
      },
      transactions: transactions.slice(0, 10),
    })
  } catch (error) {
    console.error("Portfolio fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch portfolio" }, { status: 500 })
  }
}