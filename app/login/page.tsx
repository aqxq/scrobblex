"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Music, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const errorParam = searchParams.get("error")
    if (errorParam) {
      switch (errorParam) {
        case "invalid_token":
          setError("Invalid authentication token. Please try again.")
          break
        case "no_token":
          setError("No authentication token received. Please try again.")
          break
        case "user_info_failed":
          setError("Failed to retrieve user information from Last.fm.")
          break
        case "database_error":
          setError("Database error occurred. Please try again later.")
          break
        case "server_error":
          setError("Server error occurred. Please try again later.")
          break
        default:
          setError("Authentication failed. Please try again.")
      }
    }
  }, [searchParams])

  const handleLastFmLogin = async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/lastfm/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        window.location.href = data.authUrl
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to start authentication")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("Failed to connect to authentication service.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
              <Music className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white">ScrobbleX</h1>
          <p className="text-slate-400 mt-2">Trade your favorite artists like stocks</p>
        </div>

        {error && (
          <Alert className="border-red-500/50 bg-red-500/10">
            <AlertDescription className="text-red-400">{error}</AlertDescription>
          </Alert>
        )}

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="text-center">
            <CardTitle className="text-white">Welcome Back</CardTitle>
            <CardDescription className="text-slate-400">Connect your Last.fm account to start trading</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleLastFmLogin}
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Connecting...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <ExternalLink className="w-4 h-4" />
                  <span>Continue with Last.fm</span>
                </div>
              )}
            </Button>

            <p className="text-xs text-slate-500 text-center">
              Don't have a Last.fm account?{" "}
              <a
                href="https://www.last.fm/join"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300"
              >
                Sign up here
              </a>
            </p>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-4">
              <h3 className="text-white font-semibold mb-2">Real Music Data</h3>
              <p className="text-slate-400 text-sm">Stock prices based on actual Last.fm listening statistics</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-4">
              <h3 className="text-white font-semibold mb-2">Trade Artists</h3>
              <p className="text-slate-400 text-sm">Buy and sell shares of your favorite musicians</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-4">
              <h3 className="text-white font-semibold mb-2">Compete</h3>
              <p className="text-slate-400 text-sm">Climb the leaderboard and show off your music taste</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
