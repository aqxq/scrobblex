"use client"

import { Briefcase } from "lucide-react"
import type { Stock } from "@/app/page"

interface PortfolioProps {
  stockData: Stock[]
  userData: any
  onOpenStock: (symbol: string) => void
}

export default function Portfolio({ stockData, userData, onOpenStock }: PortfolioProps) {
  const calculatePortfolioValue = () => {
    return userData.portfolio.reduce((total: number, holding: any) => {
      const currentStock = stockData.find((s) => s.symbol === holding.symbol)
      return total + (currentStock ? holding.shares * currentStock.price : 0)
    }, 0)
  }

  const calculateTotalInvested = () => {
    return userData.portfolio.reduce((total: number, holding: any) => {
      return total + holding.shares * holding.avgPrice
    }, 0)
  }

  const portfolioValue = calculatePortfolioValue()
  const totalInvested = calculateTotalInvested()
  const totalGainLoss = portfolioValue - totalInvested
  const totalGainLossPercent = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">My Portfolio</h1>
        <p className="text-slate-400">Your complete investment portfolio</p>
      </div>

      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm text-slate-400 mb-2">Total Value</h3>
            <div className="text-2xl font-bold">${portfolioValue.toFixed(2)}</div>
          </div>
          <div>
            <h3 className="text-sm text-slate-400 mb-2">Total Gain/Loss</h3>
            <div className={`text-2xl font-bold ${totalGainLoss >= 0 ? "text-green-400" : "text-red-400"}`}>
              {totalGainLoss >= 0 ? "+" : ""}${Math.abs(totalGainLoss).toFixed(2)} ({totalGainLoss >= 0 ? "+" : ""}
              {totalGainLossPercent.toFixed(1)}%)
            </div>
          </div>
          <div>
            <h3 className="text-sm text-slate-400 mb-2">Holdings</h3>
            <div className="text-2xl font-bold">{userData.portfolio.length}</div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
        {userData.portfolio.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 mx-auto mb-4 text-purple-500" />
            <h4 className="text-xl font-semibold mb-2">No Holdings Yet</h4>
            <p className="text-slate-400">Start trading to build your portfolio</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-6 gap-4 p-4 bg-slate-900 border-b border-slate-700 text-sm font-semibold text-slate-400 uppercase tracking-wide">
              <div className="col-span-2">Artist</div>
              <div>Shares</div>
              <div>Avg Price</div>
              <div>Current Price</div>
              <div>P&L</div>
            </div>
            {userData.portfolio.map((holding: any) => {
              const currentStock = stockData.find((s) => s.symbol === holding.symbol)
              if (!currentStock) return null

              const currentValue = holding.shares * currentStock.price
              const investedValue = holding.shares * holding.avgPrice
              const gainLoss = currentValue - investedValue
              const gainLossPercent = (gainLoss / investedValue) * 100

              return (
                <div
                  key={holding.symbol}
                  onClick={() => onOpenStock(holding.symbol)}
                  className="grid grid-cols-6 gap-4 p-4 border-b border-slate-700 hover:bg-slate-700 transition-colors cursor-pointer items-center"
                >
                  <div className="col-span-2 flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center text-sm font-semibold">
                      {holding.symbol.substring(0, 2)}
                    </div>
                    <div>
                      <h4 className="font-semibold">{currentStock.name}</h4>
                      <div className="text-sm text-slate-400">${holding.symbol}</div>
                    </div>
                  </div>
                  <div className="font-medium">{holding.shares}</div>
                  <div className="font-medium">${holding.avgPrice.toFixed(2)}</div>
                  <div className="font-medium">${currentStock.price.toFixed(2)}</div>
                  <div className={`font-medium ${gainLoss >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {gainLoss >= 0 ? "+" : ""}${Math.abs(gainLoss).toFixed(2)} ({gainLoss >= 0 ? "+" : ""}
                    {gainLossPercent.toFixed(1)}%)
                  </div>
                </div>
              )
            })}
          </>
        )}
      </div>
    </div>
  )
}
