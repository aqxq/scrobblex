"use client"

import { useState } from "react"
import { TrendingUp, Store, Briefcase, Menu, X, Music } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { calculatePortfolioAnalytics } from "@/lib/portfolio-utils"
import type { Page, UserData, Stock } from "@/lib/types"

interface SidebarProps {
  currentPage: Page
  onPageChange: (page: Page) => void
  userData: UserData
  stocks: Stock[]
}

const navigation = [
  { id: "dashboard" as Page, name: "Dashboard", icon: TrendingUp },
  { id: "market" as Page, name: "Artist Market", icon: Store },
  { id: "portfolio" as Page, name: "My Artists", icon: Briefcase },
]

export default function Sidebar({ currentPage, onPageChange, userData, stocks }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)

  const analytics = calculatePortfolioAnalytics(userData.portfolio, stocks)
  const totalValue = userData.balance + analytics.totalValue

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden fixed top-4 left-4 z-50 p-2 glass-card">
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      <aside
        className={`
        fixed top-0 left-0 z-40 h-full w-64 glass-card border-r
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}
      >
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <Music className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold">ScrobbleX</h1>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.id

            return (
              <button
                key={item.id}
                onClick={() => {
                  onPageChange(item.id)
                  setIsOpen(false)
                }}
                className={`
                  nav-item w-full text-left
                  ${isActive ? "nav-item-active" : "nav-item-inactive"}
                `}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
                {item.id === "portfolio" && userData.portfolio.length > 0 && (
                  <span className="ml-auto text-xs bg-purple-600/20 text-purple-400 px-2 py-1 rounded-full">
                    {userData.portfolio.length}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-white/10 mt-auto">
          <div className="glass-card p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Artist Portfolio</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">ScrobbleCoins</span>
                <span>{formatCurrency(userData.balance)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Artist Stocks</span>
                <span>{formatCurrency(analytics.totalValue)}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold border-t border-white/10 pt-2">
                <span>Total Value</span>
                <span className="text-purple-400">{formatCurrency(totalValue)}</span>
              </div>
              {analytics.totalGainLoss !== 0 && (
                <div
                  className={`text-xs text-center ${analytics.totalGainLoss >= 0 ? "text-green-400" : "text-red-400"}`}
                >
                  {analytics.totalGainLoss >= 0 ? "+" : ""}
                  {formatCurrency(analytics.totalGainLoss)} today
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-sm font-bold">
              M
            </div>
            <div>
              <p className="text-sm font-medium">mus1cluvr</p>
              <p className="text-xs text-muted-foreground">{userData.transactions.length} trades</p>
            </div>
          </div>
        </div>
      </aside>

      {isOpen && <div className="lg:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setIsOpen(false)} />}
    </>
  )
}
