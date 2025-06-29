"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Music, ExternalLink, Loader2 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const errorParam = searchParams.get("error")
    if (errorParam) {
      switch (errorParam) {
        case "no_token":
          setError("No authentication token received from Last.fm")
          break
        case "invalid_token":
          setError("Invalid or expired authentication token from Last.fm")
          break
        case "user_info_failed":
          setError("Failed to retrieve user information from Last.fm")
          break
        case "callback_failed":
          setError("Authentication callback failed. Please try again.")
          break
        default:
          setError("An unknown error occurred during authentication")
      }
    }
  }, [searchParams])

  const handleLastFmLogin = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/lastfm/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.authUrl) {
        window.location.href = data.authUrl
      } else {
        throw new Error("No auth URL received from server")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("Failed to connect to authentication service")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="bg-purple-600 p-3 rounded-lg">
              <Music className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white">ScrobbleX</h1>
          <p className="text-slate-400">Trade your favorite artists like stocks</p>
        </div>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="text-center">
            <CardTitle className="text-white">Welcome Back</CardTitle>
            <CardDescription className="text-slate-400">Connect your Last.fm account to start trading</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert className="border-red-500/50 bg-red-500/10">
                <AlertDescription className="text-red-400">{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleLastFmLogin}
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Continue with Last.fm
                </>
              )}
            </Button>

            <p className="text-xs text-slate-500 text-center">
              Don't have a Last.fm account?{" "}
              <a
                href="https://www.last.fm/join"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 underline"
              >
                Sign up here
              </a>
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4 text-center">
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardContent className="p-4">
              <h3 className="font-semibold text-white mb-2">Real Music Data</h3>
              <p className="text-sm text-slate-400">Stock prices based on actual Last.fm listening statistics</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardContent className="p-4">
              <h3 className="font-semibold text-white mb-2">Trade Artists</h3>
              <p className="text-sm text-slate-400">Buy and sell shares of your favorite musicians</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardContent className="p-4">
              <h3 className="font-semibold text-white mb-2">Compete</h3>
              <p className="text-sm text-slate-400">Climb the leaderboard and show off your music taste</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}