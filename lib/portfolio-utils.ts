import type { PortfolioItem, Stock, Transaction } from "./types"

export interface PortfolioAnalytics {
  totalValue: number
  totalGainLoss: number
  totalGainLossPercent: number
  dayGainLoss: number
  dayGainLossPercent: number
  positions: PortfolioPosition[]
}

export interface PortfolioPosition extends PortfolioItem {
  currentPrice: number
  currentValue: number
  gainLoss: number
  gainLossPercent: number
  dayGainLoss: number
  dayGainLossPercent: number
}

export function calculatePortfolioAnalytics(portfolio: PortfolioItem[], stocks: Stock[]): PortfolioAnalytics {
  const positions: PortfolioPosition[] = portfolio.map((position) => {
    const currentStock = stocks.find((s) => s.symbol === position.symbol)
    const currentPrice = currentStock?.price || position.avgPrice
    const currentValue = position.shares * currentPrice
    const totalCost = position.shares * position.avgPrice
    const gainLoss = currentValue - totalCost
    const gainLossPercent = totalCost > 0 ? (gainLoss / totalCost) * 100 : 0

    const dayChange = currentStock?.change || 0
    const dayGainLoss = position.shares * dayChange
    const dayGainLossPercent = currentStock?.changePercent || 0

    return {
      ...position,
      currentPrice,
      currentValue,
      gainLoss,
      gainLossPercent,
      dayGainLoss,
      dayGainLossPercent,
    }
  })

  const totalValue = positions.reduce((sum, pos) => sum + pos.currentValue, 0)
  const totalCost = positions.reduce((sum, pos) => sum + pos.shares * pos.avgPrice, 0)
  const totalGainLoss = totalValue - totalCost
  const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0
  const dayGainLoss = positions.reduce((sum, pos) => sum + pos.dayGainLoss, 0)
  const dayGainLossPercent =
    positions.reduce((sum, pos) => sum + pos.dayGainLossPercent * pos.currentValue, 0) / totalValue

  return {
    totalValue,
    totalGainLoss,
    totalGainLossPercent,
    dayGainLoss,
    dayGainLossPercent: isNaN(dayGainLossPercent) ? 0 : dayGainLossPercent,
    positions,
  }
}

export function getTransactionsByDate(transactions: Transaction[]): Record<string, Transaction[]> {
  const grouped: Record<string, Transaction[]> = {}

  transactions.forEach((transaction) => {
    const date = new Date(transaction.timestamp).toDateString()
    if (!grouped[date]) {
      grouped[date] = []
    }
    grouped[date].push(transaction)
  })

  return grouped
}
