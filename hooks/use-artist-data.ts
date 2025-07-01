"use client"

import { useState, useEffect } from "react"

export function useArtistData() {
  const [artists, setArtists] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchArtists = async () => {
    try {
      const response = await fetch("/api/artists")
      if (response.ok) {
        const data = await response.json()
        setArtists(data.artists || [])
      }
    } catch (error) {
      console.error("Error fetching artists:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchArtists()

    const interval = setInterval(fetchArtists, 30000)
    return () => clearInterval(interval)
  }, [])

  return {
    artists,
    loading,
    refetch: fetchArtists,
  }
}