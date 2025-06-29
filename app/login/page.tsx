"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Music } from "lucide-react"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const errorParam = searchParams.get("error")
    if (errorParam) {
      switch (errorParam) {
        case "no_token":
          setError("No authentication token received from Last.fm")
          break
        case "invalid_token":
          setError("Invalid authentication token from Last.fm")
          break
        case "user_info_failed":
          setError("Failed to retrieve user information from Last.fm")
          break
        case "callback_failed":
          setError("Authentication callback failed")
          break
        default:
          setError("Authentication failed")
      }
    }
  }, [searchParams])

  const handleLastFmLogin = async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log("Starting Last.fm authentication...")

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
        console.log("Redirecting to Last.fm auth URL:", data.authUrl)
        window.location.href = data.authUrl
      } else {
        throw new Error("No auth URL received")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("Failed to connect to authentication service")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-purple-600 p-3 rounded-full">
              <Music className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">ScrobbleX</h1>
          <p className="text-gray-300">Trade your favorite artists like stocks</p>
        </div>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="text-center">
            <CardTitle className="text-white">Welcome Back</CardTitle>
            <CardDescription className="text-gray-400">Connect your Last.fm account to start trading</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert className="bg-red-900/50 border-red-700">
                <AlertDescription className="text-red-200">{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleLastFmLogin}
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              size="lg"
            >
              {isLoading ? "Connecting..." : "Continue with Last.fm"}
            </Button>

            <p className="text-center text-sm text-gray-400">
              {"Don't have a Last.fm account? "}
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
          <Card className="bg-gray-800/30 border-gray-700">
            <CardContent className="pt-6">
              <h3 className="text-white font-semibold mb-2">Real Music Data</h3>
              <p className="text-gray-400 text-sm">Stock prices based on actual Last.fm listening statistics</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/30 border-gray-700">
            <CardContent className="pt-6">
              <h3 className="text-white font-semibold mb-2">Trade Artists</h3>
              <p className="text-gray-400 text-sm">Buy and sell shares of your favorite musicians</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/30 border-gray-700">
            <CardContent className="pt-6">
              <h3 className="text-white font-semibold mb-2">Compete</h3>
              <p className="text-gray-400 text-sm">Climb the leaderboard and show off your music taste</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}