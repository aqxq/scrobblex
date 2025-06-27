"use client"

import { useState } from "react"
import StockCard from "./stock-card"
import type { Stock } from "@/app/page"

interface MarketProps {
  stockData: Stock[]
  onOpenStock: (symbol: string) => void
  onAddToWatchlist: (symbol: string) => void
  showNotification: (message: string, type: string) => void
}

export default function Market({ stockData, onOpenStock, onAddToWatchlist, showNotification }: MarketProps) {
  const [sortBy, setSortBy] = useState("change")
  const [genreFilter, setGenreFilter] = useState("all")

  const filteredAndSortedStocks = stockData
    .filter((stock) => genreFilter === "all" || stock.genre === genreFilter)
    .sort((a, b) => {
      switch (sortBy) {
        case "change":
          return Math.abs(b.change) - Math.abs(a.change)
        case "price":
          return b.price - a.price
        case "volume":
          return b.volume - a.volume
        case "name":
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Market</h1>
        <p className="text-slate-400">Browse all available artist stocks</p>
      </div>

      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <div className="flex gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-slate-400">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
            >
              <option value="change">Price Change</option>
              <option value="price">Price</option>
              <option value="volume">Volume</option>
              <option value="name">Name</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-slate-400">Genre:</label>
            <select
              value={genreFilter}
              onChange={(e) => setGenreFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
            >
              <option value="all">All Genres</option>
              <option value="Pop">Pop</option>
              <option value="Hip-Hop">Hip-Hop</option>
              <option value="R&B">R&B</option>
              <option value="Alternative">Alternative</option>
              <option value="Soul">Soul</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAndSortedStocks.map((stock) => (
          <StockCard
            key={stock.symbol}
            stock={stock}
            onOpenStock={onOpenStock}
            onAddToWatchlist={onAddToWatchlist}
            showNotification={showNotification}
          />
        ))}
      </div>
    </div>
  )
}
