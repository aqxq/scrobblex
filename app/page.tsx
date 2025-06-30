"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/sidebar"
import Header from "@/components/header"
import Dashboard from "@/components/dashboard"
import Market from "@/components/market"
import Portfolio from "@/components/portfolio"
import Leaderboard from "@/components/leaderboard"
import TradeModal from "@/components/trade-modal"
import { useUserData } from "@/hooks/use-user-data"
import { useStockData } from "@/hooks/use-stock-data"
import { Notification } from "@/components/notification"
import { useAuth } from "@/components/auth-provider"
import { Skeleton } from "@/components/ui/skeleton"

export type Page = "dashboard" | "market" | "portfolio" | "leaderboard"

export interface Stock {
  symbol: string
  name: string
  genre: string
  price: number
  change: number
  volume: number
  marketCap: number
}

export interface Transaction {
  id: number
  type: "buy" | "sell"
  symbol: string
  name: string
  shares: number
  price: number
  total: number
  date: string
  timestamp: number
}

export interface NotificationItem {
  id: number
  message: string
  type: string
}

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState<Page>("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [tradeModalOpen, setTradeModalOpen] = useState(false)
  const [currentTradeStock, setCurrentTradeStock] = useState<Stock | null>(null)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(false)

  const { user, isLoading } = useAuth()
  const router = useRouter()
  const {
    userData,
    updateBalance,
    addToPortfolio,
    removeFromPortfolio,
    addTransaction,
    addToWatchlist,
    removeFromWatchlist,
  } = useUserData()
  const { stockData } = useStockData()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user && !isLoading) {
      const timer = setTimeout(() => {
        showNotification(`Welcome back, ${user.displayName}!`, "success")
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [user, isLoading])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 p-4">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-16 w-full bg-gray-800" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-32 bg-gray-800" />
            <Skeleton className="h-32 bg-gray-800" />
            <Skeleton className="h-32 bg-gray-800" />
          </div>
          <Skeleton className="h-96 w-full bg-gray-800" />
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const showNotification = (message: string, type = "info") => {
    const id = Date.now()
    setNotifications((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    }, 5000)
  }

  const openStockDetails = (symbol: string) => {
    const stock = stockData.find((s) => s.symbol === symbol)
    if (stock) {
      setCurrentTradeStock(stock)
      setTradeModalOpen(true)
    }
  }

  const executeTrade = async (type: "buy" | "sell", shares: number) => {
    if (!currentTradeStock) return

    const total = shares * currentTradeStock.price

    if (type === "buy" && total > userData.balance) {
      showNotification("Insufficient funds", "error")
      return
    }

    if (type === "sell") {
      const holding = userData.portfolio.find((h) => h.symbol === currentTradeStock.symbol)
      if (!holding || holding.shares < shares) {
        showNotification("Insufficient shares to sell", "error")
        return
      }
    }

    setLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const transaction: Transaction = {
        id: Date.now(),
        type,
        symbol: currentTradeStock.symbol,
        name: currentTradeStock.name,
        shares,
        price: currentTradeStock.price,
        total,
        date: new Date().toISOString(),
        timestamp: Date.now(),
      }

      if (type === "buy") {
        updateBalance(userData.balance - total)
        addToPortfolio(currentTradeStock.symbol, shares, currentTradeStock.price)
      } else {
        updateBalance(userData.balance + total)
        removeFromPortfolio(currentTradeStock.symbol, shares)
      }

      addTransaction(transaction)

      setLoading(false)
      setTradeModalOpen(false)

      showNotification(
        `Successfully ${type === "buy" ? "bought" : "sold"} ${shares} shares of ${currentTradeStock.symbol}`,
        "success",
      )
    } catch (error) {
      setLoading(false)
      showNotification("Trade failed. Please try again.", "error")
    }
  }

  const quickTrade = (symbol: string, type: "buy" | "sell") => {
    const stock = stockData.find((s) => s.symbol === symbol)
    if (!stock) return

    setCurrentTradeStock(stock)
    setTradeModalOpen(true)

    setTimeout(() => {
      const event = new CustomEvent("setTradeType", { detail: type })
      window.dispatchEvent(event)
    }, 100)
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "dashboard":
        return (
          <Dashboard
            stockData={stockData}
            userData={userData}
            onOpenStock={openStockDetails}
            onAddToWatchlist={addToWatchlist}
            onRemoveFromWatchlist={removeFromWatchlist}
            onQuickTrade={quickTrade}
            showNotification={showNotification}
          />
        )
      case "market":
        return (
          <Market
            stockData={stockData}
            onOpenStock={openStockDetails}
            onAddToWatchlist={addToWatchlist}
            showNotification={showNotification}
          />
        )
      case "portfolio":
        return <Portfolio stockData={stockData} userData={userData} onOpenStock={openStockDetails} />
      case "leaderboard":
        return <Leaderboard />
      default:
        return (
          <Dashboard
            stockData={stockData}
            userData={userData}
            onOpenStock={openStockDetails}
            onAddToWatchlist={addToWatchlist}
            onRemoveFromWatchlist={removeFromWatchlist}
            onQuickTrade={quickTrade}
            showNotification={showNotification}
          />
        )
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex relative">
      <Sidebar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        user={userData}
      />

      <main className="flex-1 flex flex-col lg:ml-72">
        <Header
          stockData={stockData}
          onOpenStock={openStockDetails}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          user={userData}
        />

        <div className="flex-1 p-6">{renderCurrentPage()}</div>
      </main>

      {tradeModalOpen && currentTradeStock && (
        <TradeModal
          stock={currentTradeStock}
          userData={userData}
          onClose={() => setTradeModalOpen(false)}
          onExecuteTrade={executeTrade}
          loading={loading}
        />
      )}

      {loading && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[2000] backdrop-blur-sm">
          <div className="text-center text-white">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-300">Processing trade...</p>
          </div>
        </div>
      )}

      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            message={notification.message}
            type={notification.type}
            onClose={() => setNotifications((prev) => prev.filter((n) => n.id !== notification.id))}
          />
        ))}
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}