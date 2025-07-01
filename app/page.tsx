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
import AddFundsModal from "@/components/add-funds-modal"
import { Notification } from "@/components/notification"
import { useAuth } from "@/hooks/use-auth"
import { useUserData } from "@/hooks/use-user-data"
import { useArtistData } from "@/hooks/use-artist-data"

export type Page = "dashboard" | "market" | "portfolio" | "leaderboard"

export interface NotificationItem {
  id: number
  message: string
  type: string
}

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

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

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

    const total = shares * currentTradeArtist.current_price

    if (type === "buy" && total > userData.balance) {
      showNotification("Insufficient funds", "error")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/trade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          artistId: currentTradeArtist.id,
          shares,
          price: currentTradeArtist.current_price,
          type,
        }),
      })

      const result = await response.json()

      if (result.success) {
        await refetchUser()
        setTradeModalOpen(false)
        showNotification(result.message, "success")
      } else {
        showNotification(result.error || "Trade failed", "error")
      }
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

  if (!user) {
    return null
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