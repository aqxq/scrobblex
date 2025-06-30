"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Music } from "lucide-react"
import { useSearchParams } from "next/navigation"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "no_token":
        return "No authentication token received from Last.fm."
      case "server_config":
        return "Server configuration error. Please contact support."
      case "lastfm_session":
        return "Failed to create Last.fm session. Please try again."
      case "user_info":
        return "Failed to retrieve user information from Last.fm."
      case "database":
        return "Database error occurred. Please try again."
      case "callback":
        return "Authentication failed. Please try again."
      default:
        return "Authentication failed. Please try again."
    }
  }

  const handleLastFmLogin = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/lastfm/start", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to start authentication")
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      window.location.href = data.authUrl
    } catch (error) {
      console.error("Login error:", error)
      setIsLoading(false)
      alert("erro during log in. please try again.")}
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-pink-500 p-4 rounded-full">
              <Music className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white">ScrobbleX</h1>
          <p className="text-gray-300">Trade your favorite artists like stocks</p>
        </div>

        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-white text-2xl">Welcome Back</CardTitle>
            <CardDescription className="text-gray-400">Connect your Last.fm account to start trading</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert className="bg-red-900/50 border-red-700">
                <AlertDescription className="text-red-200">{getErrorMessage(error)}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleLastFmLogin}
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 text-lg"
            >
              <Music className="mr-2 h-5 w-5" />
              {isLoading ? "Connecting..." : "Continue with Last.fm"}
            </Button>

            <p className="text-center text-sm text-gray-400">
              Don't have a Last.fm account?{" "}
              <a
                href="https://www.last.fm/join"
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-400 hover:text-pink-300"
              >
                Sign up here
              </a>
            </p>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-gray-800/30 border-gray-700 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <h3 className="text-white font-semibold mb-2">Real Music Data</h3>
              <p className="text-gray-400 text-sm">Stock prices based on actual Last.fm listening statistics</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/30 border-gray-700 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <h3 className="text-white font-semibold mb-2">Trade Artists</h3>
              <p className="text-gray-400 text-sm">Buy and sell shares of your favorite musicians</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/30 border-gray-700 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <h3 className="text-white font-semibold mb-2">Compete</h3>
              <p className="text-gray-400 text-sm">Climb the leaderboard and show off your music taste</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
