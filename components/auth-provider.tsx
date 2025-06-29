"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

interface User {
  id: string
  displayName: string
  lastfmUsername?: string
  lastfmVerified: boolean
  balance: number
  scrobbleCoins: number
  totalScrobbles: number
  profileImageUrl?: string
  isAdmin: boolean
}

interface Portfolio {
  totalValue: number
  totalInvested: number
  gainLoss: number
  gainLossPercent: number
  cashBalance: number
  totalAssets: number
  positions: Array<{
    artistName: string
    shares: number
    averagePrice: number
    currentPrice: number
    totalValue: number
    gainLoss: number
    gainLossPercent: number
    artistImage?: string
  }>
}

interface AuthContextType {
  user: User | null
  portfolio: Portfolio | null
  isLoading: boolean
  refreshData: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/user/portfolio")
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setPortfolio(data.portfolio)
      } else {
        setUser(null)
        setPortfolio(null)
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error)
      setUser(null)
      setPortfolio(null)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setUser(null)
      setPortfolio(null)
      window.location.href = "/login"
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  useEffect(() => {
    fetchUserData()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        portfolio,
        isLoading,
        refreshData: fetchUserData,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
