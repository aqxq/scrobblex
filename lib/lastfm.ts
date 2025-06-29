const LASTFM_API_KEY = process.env.LASTFM_API_KEY!
const LASTFM_SECRET = process.env.LASTFM_SECRET!
const LASTFM_CALLBACK_URL = process.env.LASTFM_CALLBACK_URL!

export interface LastFmUser {
  name: string
  realname: string
  image: Array<{ "#text": string; size: string }>
  playcount: string
  registered: { unixtime: string }
}

export interface LastFmTrack {
  name: string
  artist: { "#text": string }
  date?: { uts: string }
}

export class LastFmAPI {
  private apiKey: string
  private secret: string

  constructor() {
    this.apiKey = LASTFM_API_KEY
    this.secret = LASTFM_SECRET
  }

  generateAuthUrl(): string {
    const params = new URLSearchParams({
      api_key: this.apiKey,
      cb: LASTFM_CALLBACK_URL,
    })
    return `http://www.last.fm/api/auth/?${params.toString()}`
  }

  async getSession(token: string): Promise<{ key: string; name: string } | null> {
    try {
      const params = new URLSearchParams({
        method: "auth.getSession",
        api_key: this.apiKey,
        token,
        format: "json",
      })

      const response = await fetch(`http://ws.audioscrobbler.com/2.0/?${params.toString()}`)
      const data = await response.json()

      if (data.session) {
        return {
          key: data.session.key,
          name: data.session.name,
        }
      }
      return null
    } catch (error) {
      console.error("Last.fm session error:", error)
      return null
    }
  }

  async getUserInfo(username: string): Promise<LastFmUser | null> {
    try {
      const params = new URLSearchParams({
        method: "user.getInfo",
        user: username,
        api_key: this.apiKey,
        format: "json",
      })

      const response = await fetch(`http://ws.audioscrobbler.com/2.0/?${params.toString()}`)
      const data = await response.json()

      return data.user || null
    } catch (error) {
      console.error("Last.fm user info error:", error)
      return null
    }
  }

  async getRecentTracks(username: string, limit = 10): Promise<LastFmTrack[]> {
    try {
      const params = new URLSearchParams({
        method: "user.getRecentTracks",
        user: username,
        api_key: this.apiKey,
        format: "json",
        limit: limit.toString(),
      })

      const response = await fetch(`http://ws.audioscrobbler.com/2.0/?${params.toString()}`)
      const data = await response.json()

      return data.recenttracks?.track || []
    } catch (error) {
      console.error("Last.fm recent tracks error:", error)
      return []
    }
  }

  async getTopTracks(): Promise<Array<{ name: string; artist: string }>> {
    try {
      const params = new URLSearchParams({
        method: "chart.getTopTracks",
        api_key: this.apiKey,
        format: "json",
        limit: "50",
      })

      const response = await fetch(`http://ws.audioscrobbler.com/2.0/?${params.toString()}`)
      const data = await response.json()

      return (
        data.tracks?.track?.map((track: any) => ({
          name: track.name,
          artist: track.artist.name,
        })) || []
      )
    } catch (error) {
      console.error("Last.fm top tracks error:", error)
      return []
    }
  }
}

export const lastfmAPI = new LastFmAPI()
