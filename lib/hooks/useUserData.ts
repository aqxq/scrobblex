"use client"

import { useState, useEffect } from "react"
import type { UserData, Transaction, PortfolioItem } from "../types"

const INITIAL_USER_DATA: UserData = {
  balance: 10000,
  portfolio: [],
  watchlist: [],
  transactions: [],
}

export function useUserData() {
  const [userData, setUserData] = useState<UserData>(INITIAL_USER_DATA)

  useEffect(() => {
    const saved = localStorage.getItem("stock-trader-user-data")
    if (saved) {
      try {
        setUserData(JSON.parse(saved))
      } catch (error) {
        console.error("Failed to load user data:", error)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("stock-trader-user-data", JSON.stringify(userData))
  }, [userData])

  const buyStock = (symbol: string, shares: number, price: number) => {
    const total = shares * price

    if (total > userData.balance) {
      throw new Error("Insufficient funds")
    }

    setUserData((prev) => {
      const existingPosition = prev.portfolio.find((item) => item.symbol === symbol)
      let newPortfolio: PortfolioItem[]

      if (existingPosition) {

        const totalShares = existingPosition.shares + shares
        const totalCost = existingPosition.shares * existingPosition.avgPrice + total
        const newAvgPrice = totalCost / totalShares

        newPortfolio = prev.portfolio.map((item) =>
          item.symbol === symbol ? { ...item, shares: totalShares, avgPrice: newAvgPrice } : item,
        )
      } else {

        newPortfolio = [
          ...prev.portfolio,
          {
            symbol,
            shares,
            avgPrice: price,
            purchaseDate: new Date().toISOString(),
          },
        ]
      }

      const transaction: Transaction = {
        id: Date.now().toString(),
        type: "buy",
        symbol,
        shares,
        price,
        total,
        timestamp: new Date().toISOString(),
      }

      return {
        ...prev,
        balance: prev.balance - total,
        portfolio: newPortfolio,
        transactions: [transaction, ...prev.transactions],
      }
    })
  }

  const sellStock = (symbol: string, shares: number, price: number) => {
    const position = userData.portfolio.find((item) => item.symbol === symbol)

    if (!position || position.shares < shares) {
      throw new Error("Insufficient shares")
    }

    const total = shares * price

    setUserData((prev) => {
      const newPortfolio = prev.portfolio
        .map((item) => (item.symbol === symbol ? { ...item, shares: item.shares - shares } : item))
        .filter((item) => item.shares > 0)

      const transaction: Transaction = {
        id: Date.now().toString(),
        type: "sell",
        symbol,
        shares,
        price,
        total,
        timestamp: new Date().toISOString(),
      }

      return {
        ...prev,
        balance: prev.balance + total,
        portfolio: newPortfolio,
        transactions: [transaction, ...prev.transactions],
      }
    })
  }

  return {
    userData,
    buyStock,
    sellStock,
  }
}