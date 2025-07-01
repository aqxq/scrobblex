"use client"

import { useState, useRef, useEffect } from "react"
import { Search, Menu, Plus, ChevronDown, User } from "lucide-react"
import type { Stock } from "@/app/page"

interface HeaderProps {
  stockData: Stock[]
  onOpenStock: (symbol: string) => void
  onToggleSidebar: () => void
  userBalance: number
}

export default function Header({ stockData, onOpenStock, onToggleSidebar, userBalance }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Stock[]>([])
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (searchQuery.trim()) {
      const results = stockData.filter(
        (stock) =>
          stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setSearchResults(results)
      setShowResults(true)
    } else {
      setShowResults(false)
    }
  }, [searchQuery, stockData])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const formatPercent = (value: number) => {
    return (value >= 0 ? "+" : "") + value.toFixed(1) + "%"
  }

  const selectSearchResult = (symbol: string) => {
    setShowResults(false)
    setSearchQuery("")
    onOpenStock(symbol)
  }

  return (
    <header className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-40">
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex-1 max-w-md relative" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search for stocks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>

          {showResults && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
              {searchResults.length === 0 ? (
                <div className="p-4 text-center text-slate-400">
                  <Search className="w-5 h-5 mx-auto mb-2" />
                  <span>No results found for "{searchQuery}"</span>
                </div>
              ) : (
                searchResults.map((stock) => (
                  <button
                    key={stock.symbol}
                    onClick={() => selectSearchResult(stock.symbol)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-slate-700 transition-colors border-b border-slate-700 last:border-b-0"
                  >
                    <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center text-xs font-semibold">
                      {stock.symbol.substring(0, 2)}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-white">{stock.name}</div>
                      <div className="text-xs text-slate-400">${stock.symbol}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-white">${stock.price.toFixed(2)}</div>
                      <div className={`text-xs ${stock.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {formatPercent(stock.change)}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Funds</span>
          </button>

          <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </div>
        </div>
      </div>
    </header>
  )
}
