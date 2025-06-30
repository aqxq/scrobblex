"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { getCurrentSession, type JWTPayload } from "@/lib/auth"

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
  user: JWTPayload | null
  portfolio: Portfolio | null
  isLoading: boolean
  refreshData: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<JWTPayload | null>(null)
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchUserData = async () => {
    try {
      console.log("Fetching user data")

      const clientSession = getCurrentSession()
      if (clientSession) {
        setUser(clientSession)
        setIsLoading(false)
        return
      }

      const sessionResponse = await fetch("/api/auth/session")
      if (!sessionResponse.ok) {
        console.log("No valid session found")
        setUser(null)
        setPortfolio(null)
        setIsLoading(false)
        return
      }

      const sessionData = await sessionResponse.json()
      if (!sessionData.user) {
        console.log("No user in session")
        setUser(null)
        setPortfolio(null)
        setIsLoading(false)
        return
      }

      setUser(sessionData.user)

      const portfolioResponse = await fetch("/api/user/portfolio")
      if (portfolioResponse.ok) {
        const portfolioData = await portfolioResponse.json()
        setPortfolio(portfolioData.portfolio)
      } else {
        console.error("Failed to fetch portfolio data")
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
    throw new Error("useAuth must b used within an AithProvider")
  }
  return context
}