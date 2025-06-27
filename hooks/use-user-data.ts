"use client"

import { useState, useEffect, useCallback } from "react"
import type { Transaction } from "@/app/page"

interface UserData {
  balance: number
  portfolio: Array<{
    symbol: string
    shares: number
    avgPrice: number
    addedDate: string
  }>
  transactions: Transaction[]
  watchlist: string[]
  achievements: any[]
  joinDate: string
}

const STORAGE_KEY = "scrobblex_user_data"

export function useUserData() {
  const [userData, setUserData] = useState<UserData>({
    balance: 10000,
    portfolio: [],
    transactions: [],
    watchlist: [],
    achievements: [],
    joinDate: new Date().toISOString(),
  })

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsedData = JSON.parse(saved)
        setUserData(parsedData)
      }
    } catch (error) {
      console.error("Failed to load user data:", error)
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData))
    } catch (error) {
      console.error("Failed to save user data:", error)
    }
  }, [userData])

  const updateBalance = useCallback((newBalance: number) => {
    setUserData((prev) => ({
      ...prev,
      balance: newBalance,
    }))
  }, [])

  const addToPortfolio = useCallback((symbol: string, shares: number, price: number) => {
    setUserData((prev) => {
      const existing = prev.portfolio.find((item) => item.symbol === symbol)
      let newPortfolio

      if (existing) {
        const totalShares = existing.shares + shares
        const totalValue = existing.shares * existing.avgPrice + shares * price
        newPortfolio = prev.portfolio.map((item) =>
          item.symbol === symbol ? { ...item, shares: totalShares, avgPrice: totalValue / totalShares } : item,
        )
      } else {
        newPortfolio = [
          ...prev.portfolio,
          {
            symbol,
            shares,
            avgPrice: price,
            addedDate: new Date().toISOString(),
          },
        ]
      }

      return {
        ...prev,
        portfolio: newPortfolio,
      }
    })
  }, [])

  const removeFromPortfolio = useCallback((symbol: string, shares: number) => {
    setUserData((prev) => {
      const existing = prev.portfolio.find((item) => item.symbol === symbol)
      if (!existing) return prev

      let newPortfolio
      if (existing.shares <= shares) {
        newPortfolio = prev.portfolio.filter((item) => item.symbol !== symbol)
      } else {
        newPortfolio = prev.portfolio.map((item) =>
          item.symbol === symbol ? { ...item, shares: item.shares - shares } : item,
        )
      }

      return {
        ...prev,
        portfolio: newPortfolio,
      }
    })
  }, [])

  const addTransaction = useCallback((transaction: Transaction) => {
    setUserData((prev) => ({
      ...prev,
      transactions: [transaction, ...prev.transactions],
    }))
  }, [])

  const addToWatchlist = useCallback((symbol: string) => {
    setUserData((prev) => {
      if (prev.watchlist.includes(symbol)) return prev

      return {
        ...prev,
        watchlist: [...prev.watchlist, symbol],
      }
    })
  }, [])

  const removeFromWatchlist = useCallback((symbol: string) => {
    setUserData((prev) => ({
      ...prev,
      watchlist: prev.watchlist.filter((s) => s !== symbol),
    }))
  }, [])

  return {
    userData,
    updateBalance,
    addToPortfolio,
    removeFromPortfolio,
    addTransaction,
    addToWatchlist,
    removeFromWatchlist,
  }
}
