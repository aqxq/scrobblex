"use client"

import { Search, Bell, Coins } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import type { UserData } from "@/lib/types"

interface HeaderProps {
  userData: UserData
}

export default function Header({ userData }: HeaderProps) {
  const portfolioValue = userData.portfolio.reduce((total, position) => {

    return total + position.shares * position.avgPrice
  }, 0)

  const totalValue = userData.balance + portfolioValue

  return (
    <header className="glass-card border-b p-4 mb-6">
      <div className="flex items-center justify-between">
        { }
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search artists..."
              className="w-full pl-10 pr-4 py-2 bg-background/50 border border-white/10 rounded-lg 
                         text-foreground placeholder-muted-foreground
                         focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50
                         transition-all duration-200"
            />
          </div>
        </div>

        { }
        <div className="flex items-center gap-6">
          <button className="p-2 glass-card hover:bg-white/10 transition-colors rounded-lg">
            <Bell className="w-5 h-5" />
          </button>

          <div className="text-right">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Coins className="w-3 h-3 text-yellow-500" />
              ScrobbleCoins
            </p>
            <p className="text-lg font-bold text-green-400">{formatCurrency(userData.balance)}</p>
          </div>

          <div className="text-right">
            <p className="text-sm text-muted-foreground">Portfolio Value</p>
            <p className="text-lg font-bold">{formatCurrency(totalValue)}</p>
          </div>
        </div>
      </div>
    </header>
  )
}