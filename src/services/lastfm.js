import crypto from "crypto"
import { config } from "../config/environment.js"
import { logger } from "../utils/logger.js"

export class LastfmService {
  constructor() {
    this.apiKey = config.LASTFM_API_KEY
    this.secret = config.LASTFM_API_SECRET
    this.baseUrl = "http://ws.audioscrobbler.com/2.0/"
  }

  generateSignature(params) {
    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${key}${params[key]}`)
      .join("")

    return crypto
      .createHash("md5")
      .update(sortedParams + this.secret)
      .digest("hex")
  }

  async makeRequest(params) {
    const url = new URL(this.baseUrl)

    Object.keys(params).forEach((key) => {
      url.searchParams.append(key, params[key])
    })

    try {
      const response = await fetch(url)
      const data = await response.json()

      if (data.error) {
        throw new Error(`Last.fm API error: ${data.message}`)
      }

      return data
    } catch (error) {
      logger.error("Last.fm API request failed:", error)
      throw error
    }
  }

  async getToken() {
    const params = {
      method: "auth.gettoken",
      api_key: this.apiKey,
      format: "json",
    }

    params.api_sig = this.generateSignature(params)

    const data = await this.makeRequest(params)
    return data.token
  }

  getAuthUrl(token) {
    return `http://www.last.fm/api/auth/?api_key=${this.apiKey}&token=${token}&cb=${encodeURIComponent(config.LASTFM_CALLBACK_URL)}`
  }

  async getSession(token) {
    const params = {
      method: "auth.getsession",
      api_key: this.apiKey,
      token: token,
      format: "json",
    }

    params.api_sig = this.generateSignature(params)

    const data = await this.makeRequest(params)
    return data.session
  }

  async getUserInfo(sessionKey) {
    const params = {
      method: "user.getinfo",
      api_key: this.apiKey,
      sk: sessionKey,
      format: "json",
    }

    params.api_sig = this.generateSignature(params)

    const data = await this.makeRequest(params)
    return data.user
  }

  async getArtistInfo(artistName) {
    const params = {
      method: "artist.getinfo",
      api_key: this.apiKey,
      artist: artistName,
      format: "json",
    }

    const data = await this.makeRequest(params)
    return data.artist
  }

  async getTopArtists(limit = 50) {
    const params = {
      method: "chart.gettopartists",
      api_key: this.apiKey,
      limit: limit,
      format: "json",
    }

    const data = await this.makeRequest(params)
    return data.artists.artist
  }
}

export const lastfmService = new LastfmService()
