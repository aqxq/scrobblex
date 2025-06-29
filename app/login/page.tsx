"use client"

import { useState, useEffect } from "react"
import { Music, ExternalLink, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter, useSearchParams } from "next/navigation"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const authStatus = searchParams.get("auth")
    if (authStatus === "success") {
      router.push("/")
    } else if (authStatus === "error") {
      setError("Authentication failed. Please try again.")
    }
  }, [searchParams, router])

  const handleLastFmLogin = async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/lastfm/start", {
        method: "POST",
      })
      const data = await response.json()

      if (data.authUrl) {
        window.location.href = data.authUrl
      } else {
        throw new Error("No auth URL received.")
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("Failed to connect to Last.fm. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
              <Music className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">ScrobbleX</h1>
          </div>
          <p className="text-slate-400">Trade your favorite artists like stocks</p>
        </div>
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="text-center">
            <CardTitle className="text-white">Welcome Back</CardTitle>
            <CardDescription className="text-slate-400">
              Connect your Last.fm account to start trading
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <Button
              onClick={handleLastFmLogin}
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Continue with Last.fm
                </>
              )}
            </Button>

            <div className="text-center text-sm text-slate-400">
              <p>
                Don&apos;t have a Last.fm account?{" "}
                <a
                  href="https://www.last.fm/join"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 underline"
                >
                  Sign up here
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 gap-4 text-center">
          <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-800">
            <h3 className="font-semibold text-white mb-2">Real Music Data</h3>
            <p className="text-sm text-slate-400">Stock prices based on actual Last.fm listening statistics</p>
          </div>
          <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-800">
            <h3 className="font-semibold text-white mb-2">Trade Artists</h3>
            <p className="text-sm text-slate-400">Buy and sell shares of your favorite musicians</p>
          </div>
          <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-800">
            <h3 className="font-semibold text-white mb-2">Compete</h3>
            <p className="text-sm text-slate-400">Climb the leaderboard and show off your music taste</p>
          </div>
        </div>
      </div>
    </div>
  )
}