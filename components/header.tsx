"use client"

import { useState } from "react"
import { Search, Menu, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { Stock } from "@/components/main-dashboard"

interface HeaderProps {
  stockData: Stock[]
  onOpenStock: (symbol: string) => void
  onToggleSidebar: () => void
  user: any
}

export default function Header({ stockData, onOpenStock, onToggleSidebar, user }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showResults, setShowResults] = useState(false)

  const filteredStocks = stockData.filter(
    (stock) =>
      stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <header className="bg-slate-900 border-b border-slate-800 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-slate-300 hover:text-white"
            onClick={onToggleSidebar}
          >
            <Menu className="w-5 h-5" />
          </Button>

          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search artists..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setShowResults(e.target.value.length > 0)
                }}
                onFocus={() => setShowResults(searchQuery.length > 0)}
                onBlur={() => setTimeout(() => setShowResults(false), 200)}
                className="pl-10 w-64 bg-slate-800 border-slate-700 text-white placeholder-slate-400"
              />
            </div>

            {showResults && filteredStocks.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
                {filteredStocks.slice(0, 5).map((stock) => (
                  <button
                    key={stock.symbol}
                    className="w-full px-4 py-2 text-left hover:bg-slate-700 flex items-center justify-between"
                    onClick={() => {
                      onOpenStock(stock.symbol)
                      setShowResults(false)
                      setSearchQuery("")
                    }}
                  >
                    <div>
                      <p className="text-white font-medium">{stock.name}</p>
                      <p className="text-slate-400 text-sm">{stock.symbol}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white">${stock.price.toFixed(2)}</p>
                      <p className={`text-sm ${stock.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {stock.change >= 0 ? "+" : ""}
                        {stock.change.toFixed(2)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-slate-400">Balance</p>
              <p className="text-lg font-bold text-green-400">${user?.balance?.toLocaleString() || "0"}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400">Scrobble Coins</p>
              <p className="text-lg font-bold text-purple-400">{user?.scrobbleCoins?.toLocaleString() || "0"}</p>
            </div>
          </div>

          <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white relative">
            <Bell className="w-5 h-5" />
            <Badge className="absolute -top-1 -right-1 w-2 h-2 p-0 bg-red-500" />
          </Button>

          <Avatar className="w-8 h-8">
            <AvatarImage src={user?.profileImageUrl || "/placeholder.svg"} alt={user?.displayName} />
            <AvatarFallback className="bg-purple-500 text-white text-sm">
              {user?.displayName?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
