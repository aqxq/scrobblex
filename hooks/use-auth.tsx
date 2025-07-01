"use client"

import { useState, useEffect } from "react"

interface User {
  id: string
  email: string
  displayName: string
  lastfmUsername?: string
  lastfmVerified: boolean
  balance: number
  isAdmin: boolean
  createdAt: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const response = await fetch("/api/auth/session")
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error("Session check failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setUser(null)
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return {
    user,
    loading,
    logout,
    refetch: checkSession,
  }
}