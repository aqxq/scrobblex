"use client"

import { useState, useEffect } from "react"
import type { Stock } from "@/app/page"

const generateMockStocks = (): Stock[] => {
  const artists = [
    { symbol: "TAYLOR", name: "Taylor Swift", genre: "Pop" },
    { symbol: "DRAKE", name: "Drake", genre: "Hip-Hop" },
    { symbol: "KLAMAR", name: "Kendrick Lamar", genre: "Hip-Hop" },
    { symbol: "BILLIE", name: "Billie Eilish", genre: "Alternative" },
    { symbol: "WEEKND", name: "The Weeknd", genre: "R&B" },
    { symbol: "ARIANA", name: "Ariana Grande", genre: "Pop" },
    { symbol: "POSTY", name: "Post Malone", genre: "Hip-Hop" },
    { symbol: "DUALIPA", name: "Dua Lipa", genre: "Pop" },
    { symbol: "SHEERAN", name: "Ed Sheeran", genre: "Pop" },
    { symbol: "ADELE", name: "Adele", genre: "Soul" },
  ]

  return artists.map((artist) => ({
    ...artist,
    price: 15 + Math.random() * 30,
    change: (Math.random() - 0.5) * 20,
    volume: Math.floor(Math.random() * 5000000) + 1000000,
    marketCap: Math.floor(Math.random() * 1000000000) + 100000000,
  }))
}

export function useStockData() {
  const [stockData, setStockData] = useState<Stock[]>(generateMockStocks())

  useEffect(() => {

    const interval = setInterval(() => {
      setStockData((prevData) =>
        prevData.map((stock) => ({
          ...stock,
          price: Math.max(1, stock.price + (Math.random() - 0.5) * 0.5),
          change: stock.change + (Math.random() - 0.5) * 2,
        })),
      )
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  return { stockData }
}
