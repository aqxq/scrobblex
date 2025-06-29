"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Music, CheckCircle, Clock, RefreshCw } from "lucide-react"
import { useAuth } from "./auth-provider"

interface VerificationModalProps {
  isOpen: boolean
  onClose: () => void
}

export function VerificationModal({ isOpen, onClose }: VerificationModalProps) {
  const { refreshData } = useAuth()
  const [challenge, setChallenge] = useState<{
    songName: string
    artistName: string
    challengeToken: string
    expiresAt: string
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [message, setMessage] = useState("")
  const [isVerified, setIsVerified] = useState(false)

  const startChallenge = async () => {
    setIsLoading(true)
    setMessage("")
    try {
      const response = await fetch("/api/auth/verify-song", {
        method: "POST",
      })
      const data = await response.json()

      if (response.ok) {
        setChallenge(data)
      } else {
        setMessage(data.error || "Failed to start challenge")
      }
    } catch (error) {
      setMessage("Failed to start challenge")
    } finally {
      setIsLoading(false)
    }
  }

  const checkScrobble = async () => {
    if (!challenge) return

    setIsChecking(true)
    setMessage("")
    try {
      const response = await fetch("/api/auth/check-scrobble", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeToken: challenge.challengeToken }),
      })
      const data = await response.json()

      if (data.success) {
        setIsVerified(true)
        setMessage(data.message)
        await refreshData()
        setTimeout(() => {
          onClose()
        }, 2000)
      } else {
        setMessage(data.message || "Verification failed")
      }
    } catch (error) {
      setMessage("Failed to check verification")
    } finally {
      setIsChecking(false)
    }
  }

  const resetChallenge = () => {
    setChallenge(null)
    setMessage("")
    setIsVerified(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Verify Your Last.fm Account
          </DialogTitle>
          <DialogDescription>
            Play a specific song to verify your Last.fm account and unlock full trading features.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!challenge && !isVerified && (
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                We'll give you a song to play. Once you scrobble it to Last.fm, your account will be verified.
              </p>
              <Button onClick={startChallenge} disabled={isLoading} className="w-full">
                {isLoading ? "Generating Challenge..." : "Start Verification"}
              </Button>
            </div>
          )}

          {challenge && !isVerified && (
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center space-y-2">
                    <h3 className="font-semibold">Play This Song:</h3>
                    <div className="text-lg font-bold text-purple-600">"{challenge.songName}"</div>
                    <div className="text-md text-gray-600">by {challenge.artistName}</div>
                  </div>
                </CardContent>
              </Card>

              <div className="text-sm text-gray-600 space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Challenge expires in 10 minutes
                </div>
                <p>
                  1. Play this song on any music platform connected to Last.fm 2. Let it scrobble to your Last.fm
                  profile 3. Click "Check Verification" below
                </p>
              </div>

              <div className="flex gap-2">
                <Button onClick={checkScrobble} disabled={isChecking} className="flex-1">
                  {isChecking ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    "Check Verification"
                  )}
                </Button>
                <Button variant="outline" onClick={resetChallenge}>
                  New Song
                </Button>
              </div>
            </div>
          )}

          {isVerified && (
            <div className="text-center space-y-4">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
              <div>
                <h3 className="font-semibold text-green-600">Verification Successful!</h3>
                <p className="text-sm text-gray-600">Your Last.fm account is now verified.</p>
              </div>
            </div>
          )}

          {message && (
            <div
              className={`text-sm p-3 rounded ${
                isVerified ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"
              }`}
            >
              {message}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
