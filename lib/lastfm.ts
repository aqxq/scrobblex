import crypto from "crypto"

interface LastFmSession {
  name: string
  key: string
  subscriber: string
}

interface LastFmUserInfo {
  name: string
  realname?: string
  playcount: string
  country?: string
  image?: Array<{
    "#text": string
    size: string
  }>
  registered?: {
    unixtime: string
  }
}

interface LastFmTrack {
  name: string
  artist: {
    "#text": string
  }
  album?: {
    "#text": string
  }
  "@attr"?: {
    nowplaying?: string
  }
}

class LastFmAPI {
  private apiKey: string
  private secret: string
  private baseUrl = "https://ws.audioscrobbler.com/2.0/"

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_LASTFM_API_KEY || process.env.LASTFM_API_KEY || ""
    this.secret = process.env.LASTFM_SECRET || ""

    if (!this.apiKey) {
      console.error(
        "Last.fm API key is missing. Please set NEXT_PUBLIC_LASTFM_API_KEY or LASTFM_API_KEY environment variable.",
      )
      throw new Error("Last.fm API key is required")
    }
    if (!this.secret) {
      console.error("Last.fm secret is missing. Please set LASTFM_SECRET environment variable.")
      throw new Error("Last.fm secret is required")
    }

    console.log("Last.fm API initialized with key:", this.apiKey.substring(0, 8) + "...")
  }

  private generateSignature(params: Record<string, string>): string {
    const sortedKeys = Object.keys(params).sort()
    const paramString = sortedKeys.map((key) => `${key}${params[key]}`).join("")
    const signatureString = paramString + this.secret
    return crypto.createHash("md5").update(signatureString, "utf8").digest("hex")
  }

  async getAuthUrl(callbackUrl: string): Promise<string> {
    console.log("Generating Last.fm auth URL with callback:", callbackUrl)

    const params = new URLSearchParams({
      api_key: this.apiKey,
      cb: callbackUrl,
    })

    const authUrl = `https://www.last.fm/api/auth/?${params.toString()}`
    console.log("Generated auth URL:", authUrl)

    return authUrl
  }

  async getSession(token: string): Promise<LastFmSession | null> {
    try {
      console.log("Getting Last.fm session for token:", token.substring(0, 10) + "...")

      const params = {
        method: "auth.getSession",
        api_key: this.apiKey,
        token: token,
      }

      const signature = this.generateSignature(params)

      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          ...params,
          api_sig: signature,
          format: "json",
        }),
      })

      const data = await response.json()

      if (data.error) {
        console.error("Last.fm API error:", data.error, data.message)
        return null
      }

      console.log("Successfully got Last.fm session for user:", data.session?.name)
      return data.session
    } catch (error) {
      console.error("Error getting Last.fm session:", error)
      return null
    }
  }

  async getUserInfo(username: string): Promise<LastFmUserInfo | null> {
    try {
      console.log("Getting user info for:", username)

      const params = new URLSearchParams({
        method: "user.getInfo",
        user: username,
        api_key: this.apiKey,
        format: "json",
      })

      const response = await fetch(`${this.baseUrl}?${params.toString()}`)
      const data = await response.json()

      if (data.error) {
        console.error("Last.fm API error:", data.error, data.message)
        return null
      }

      console.log("Successfully got user info for:", username)
      return data.user
    } catch (error) {
      console.error("Error getting user info:", error)
      return null
    }
  }

  async getRecentTracks(username: string, limit = 10): Promise<LastFmTrack[]> {
    try {
      const params = new URLSearchParams({
        method: "user.getRecentTracks",
        user: username,
        api_key: this.apiKey,
        limit: limit.toString(),
        format: "json",
      })

      const response = await fetch(`${this.baseUrl}?${params.toString()}`)
      const data = await response.json()

      if (data.error) {
        console.error("Last.fm API error:", data.error, data.message)
        return []
      }

      return data.recenttracks?.track || []
    } catch (error) {
      console.error("Error getting recent tracks:", error)
      return []
    }
  }

  async getTopArtists(username: string, period = "overall", limit = 50): Promise<any[]> {
    try {
      const params = new URLSearchParams({
        method: "user.getTopArtists",
        user: username,
        api_key: this.apiKey,
        period: period,
        limit: limit.toString(),
        format: "json",
      })

      const response = await fetch(`${this.baseUrl}?${params.toString()}`)
      const data = await response.json()

      if (data.error) {
        console.error("Last.fm API error:", data.error, data.message)
        return []
      }

      return data.topartists?.artist || []
    } catch (error) {
      console.error("Error getting top artists:", error)
      return []
    }
  }
}

export const lastfmAPI = new LastFmAPI()
