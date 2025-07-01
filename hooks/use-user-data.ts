"use client"

import { useState, useEffect } from "react"
import { useAuth } from "./use-auth"

interface UserData {
  balance: number
  portfolio: any[]
  watchlist: any[]
  transactions: any[]
  lastfmData?: any
}

export function useUserData() {
  const { user } = useAuth()
  const [userData, setUserData] = useState<UserData>({
    balance: 0,
    portfolio: [],
    watchlist: [],
    transactions: [],
  })
  const [loading, setLoading] = useState(true)

  const fetchUserData = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      const [portfolioRes, watchlistRes, transactionsRes, lastfmRes] = await Promise.all([
        fetch("/api/user/portfolio"),
        fetch("/api/user/watchlist"),
        fetch("/api/user/transactions"),
        fetch("/api/user/lastfm-data"),
      ])

      const [portfolio, watchlist, transactions, lastfmData] = await Promise.all([
        portfolioRes.ok ? portfolioRes.json() : { positions: [] },
        watchlistRes.ok ? watchlistRes.json() : { watchlist: [] },
        transactionsRes.ok ? transactionsRes.json() : { transactions: [] },
        lastfmRes.ok ? lastfmRes.json() : null,
      ])

      setUserData({
        balance: user.balance,
        portfolio: portfolio.positions || [],
        watchlist: watchlist.watchlist || [],
        transactions: transactions.transactions || [],
        lastfmData,
      })
    } catch (error) {
      console.error("Error fetching user data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserData()
  }, [user])

  return {
    userData,
    loading,
    refetch: fetchUserData,
  }
}