import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import type { Stock } from "./types"

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`
}

export function generateMockStocks(): Stock[] {
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
    { symbol: "BEYONCE", name: "Beyoncé", genre: "R&B" },
    { symbol: "BRUNO", name: "Bruno Mars", genre: "Pop" },
  ]

  return artists.map((artist) => ({
    ...artist,
    price: 15 + Math.random() * 30,
    change: (Math.random() - 0.5) * 10,
    changePercent: (Math.random() - 0.5) * 5,
    volume: Math.floor(Math.random() * 10000000) + 1000000,
    marketCap: Math.floor(Math.random() * 1000000000) + 100000000,
  }))
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
