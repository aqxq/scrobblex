"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/sidebar"
import Header from "@/components/header"
import Dashboard from "@/components/dashboard"
import Market from "@/components/market"
import Portfolio from "@/components/portfolio"
import Leaderboard from "@/components/leaderboard"
import TradeModal from "@/components/trade-modal"
import AddFundsModal from "@/components/add-funds-modal"
import { Notification } from "@/components/notification"

export type Page = "dashboard" | "market" | "portfolio" | "leaderboard"

export interface Stock {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: number
  genre: string
}

export interface NotificationItem {
  id: number
  message: string
  type: string
}

const useAuth = () => ({
  user: { id: "1", balance: 10000, lastfm_username: "mus1cluvr" },
  loading: false,
  logout: async () => {},
})

const useUserData = () => ({
  userData: {
    balance: 10000,
    portfolio: [],
    watchlist: [],
    transactions: [],
    lastfmData: null,
  },
  loading: false,
  refetch: async () => {},
})

const useArtistData = () => ({
  artists: [
    {
      id: "1",
      symbol: "KLAMAR",
      name: "Kendrick Lamar",
      current_price: 24.35,
      price_change: 1.23,
      price_change_percent: 5.3,
      volume: 1500000,
      market_cap: 24350000,
      genre: "Hip Hop",
      price: 24.35,
      change: 5.3,
      changePercent: 5.3,
      marketCap: 24350000,
    },
    {
      id: "2",
      symbol: "TSWIFT",
      name: "Taylor Swift",
      current_price: 45.67,
      price_change: -2.34,
      price_change_percent: -4.9,
      volume: 2300000,
      market_cap: 45670000,
      genre: "Pop",
      price: 45.67,
      change: -4.9,
      changePercent: -4.9,
      marketCap: 45670000,
    },
  ],
  loading: false,
  refetch: async () => {},
})

export default function Home() {
  const router = useRouter()
  const { user, loading: authLoading, logout } = useAuth()
  const { userData, loading: userLoading, refetch: refetchUser } = useUserData()
  const { artists, loading: artistsLoading } = useArtistData()

  const [currentPage, setCurrentPage] = useState<Page>("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [tradeModalOpen, setTradeModalOpen] = useState(false)
  const [addFundsModalOpen, setAddFundsModalOpen] = useState(false)
  const [currentTradeArtist, setCurrentTradeArtist] = useState<any>(null)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(false)

  const showNotification = (message: string, type = "info") => {
    const id = Date.now()
    setNotifications((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    }, 5000)
  }

  const openArtistDetails = (symbol: string) => {
    const artist = artists.find((a) => a.symbol === symbol)
    if (artist) {
      setCurrentTradeArtist(artist)
      setTradeModalOpen(true)
    }
  }

  const executeTrade = async (type: "buy" | "sell", shares: number) => {
    if (!currentTradeArtist || !user) return

    const total = shares * (currentTradeArtist.current_price || currentTradeArtist.price || 0)

    if (type === "buy" && total > userData.balance) {
      showNotification("Insufficient funds", "error")
      return
    }

    setLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      await refetchUser()
      setTradeModalOpen(false)
      showNotification(
        `Successfully ${type === "buy" ? "bought" : "sold"} ${shares} shares of ${currentTradeArtist.symbol}`,
        "success",
      )
    } catch (error) {
      showNotification("Trade failed. Please try again.", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/login")
    } catch (error) {
      showNotification("Error logging out", "error")
    }
  }

  const renderCurrentPage = () => {
    if (authLoading || userLoading || artistsLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )
    }

    switch (currentPage) {
      case "dashboard":
        return (
          <Dashboard
            artists={artists}
            userData={userData}
            onOpenArtist={openArtistDetails}
            showNotification={showNotification}
          />
        )
      case "market":
        return <Market artists={artists} onOpenArtist={openArtistDetails} showNotification={showNotification} />
      case "portfolio":
        return <Portfolio userData={userData} artists={artists} onOpenArtist={openArtistDetails} />
      case "leaderboard":
        return <Leaderboard />
      default:
        return (
          <Dashboard
            artists={artists}
            userData={userData}
            onOpenArtist={openArtistDetails}
            showNotification={showNotification}
          />
        )
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex relative">
      <Sidebar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        userData={userData}
        onLogout={handleLogout}
      />

      <main className="flex-1 flex flex-col lg:ml-72">
        <Header
          artists={artists}
          onOpenArtist={openArtistDetails}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onAddFunds={() => setAddFundsModalOpen(true)}
          userBalance={userData.balance}
        />

        <div className="flex-1 p-6">{renderCurrentPage()}</div>
      </main>

      {tradeModalOpen && currentTradeArtist && (
        <TradeModal
          artist={currentTradeArtist}
          userData={userData}
          onClose={() => setTradeModalOpen(false)}
          onExecuteTrade={executeTrade}
          loading={loading}
        />
      )}

      {addFundsModalOpen && <AddFundsModal onClose={() => setAddFundsModalOpen(false)} />}

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