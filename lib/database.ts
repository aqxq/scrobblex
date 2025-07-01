import { supabase, supabaseAdmin, type Database } from "./supabase"

export type User = Database["public"]["Tables"]["users"]["Row"]
export type Artist = Database["public"]["Tables"]["artists"]["Row"]
export type Position = Database["public"]["Tables"]["positions"]["Row"]
export type Transaction = Database["public"]["Tables"]["transactions"]["Row"]
export type WatchlistItem = Database["public"]["Tables"]["watchlist"]["Row"]
export type NewsArticle = Database["public"]["Tables"]["news"]["Row"]
export type LastFmProfile = Database["public"]["Tables"]["lastfm_profiles"]["Row"]
export type PriceHistory = Database["public"]["Tables"]["price_history"]["Row"]

export const db = {
  async createUser(userData: Database["public"]["Tables"]["users"]["Insert"]): Promise<User | null> {
    const { data, error } = await supabaseAdmin.from("users").insert(userData).select().single()

    if (error) {
      console.error("Error creating user:", error)
      return null
    }
    return data
  },

  async getUserById(id: string): Promise<User | null> {
    const { data, error } = await supabaseAdmin.from("users").select("*").eq("id", id).single()

    if (error) return null
    return data
  },

  async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabaseAdmin.from("users").select("*").eq("email", email).single()

    if (error) return null
    return data
  },

  async getUserByLastFm(username: string): Promise<User | null> {
    const { data, error } = await supabaseAdmin.from("users").select("*").eq("lastfm_username", username).single()

    if (error) return null
    return data
  },

  async updateUser(id: string, updates: Database["public"]["Tables"]["users"]["Update"]): Promise<User | null> {
    const { data, error } = await supabaseAdmin
      .from("users")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating user:", error)
      return null
    }
    return data
  },

  async getAllArtists(): Promise<Artist[]> {
    const { data, error } = await supabase.from("artists").select("*").order("market_cap", { ascending: false })

    if (error) {
      console.error("Error fetching artists:", error)
      return []
    }
    return data || []
  },

  async getArtistBySymbol(symbol: string): Promise<Artist | null> {
    const { data, error } = await supabase.from("artists").select("*").eq("symbol", symbol).single()

    if (error) return null
    return data
  },

  async updateArtistPrice(
    artistId: string,
    price: number,
    change: number,
    changePercent: number,
    volume: number,
  ): Promise<void> {
    await supabaseAdmin
      .from("artists")
      .update({
        current_price: price,
        price_change: change,
        price_change_percent: changePercent,
        volume: volume,
        updated_at: new Date().toISOString(),
      })
      .eq("id", artistId)
  },

  async getUserPositions(userId: string): Promise<(Position & { artist: Artist })[]> {
    const { data, error } = await supabase
      .from("positions")
      .select(`
        *,
        artist:artists(*)
      `)
      .eq("user_id", userId)

    if (error) {
      console.error("Error fetching positions:", error)
      return []
    }
    return data || []
  },

  async getPosition(userId: string, artistId: string): Promise<Position | null> {
    const { data, error } = await supabase
      .from("positions")
      .select("*")
      .eq("user_id", userId)
      .eq("artist_id", artistId)
      .single()

    if (error) return null
    return data
  },

  async updatePosition(
    userId: string,
    artistId: string,
    shares: number,
    averagePrice: number,
    totalInvested: number,
  ): Promise<void> {
    const existing = await this.getPosition(userId, artistId)

    if (existing) {
      if (shares === 0) {
        await supabase.from("positions").delete().eq("user_id", userId).eq("artist_id", artistId)
      } else {
        await supabase
          .from("positions")
          .update({
            shares,
            average_price: averagePrice,
            total_invested: totalInvested,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId)
          .eq("artist_id", artistId)
      }
    } else if (shares > 0) {
      await supabase.from("positions").insert({
        user_id: userId,
        artist_id: artistId,
        shares,
        average_price: averagePrice,
        total_invested: totalInvested,
      })
    }
  },

  async createTransaction(
    transaction: Database["public"]["Tables"]["transactions"]["Insert"],
  ): Promise<Transaction | null> {
    const { data, error } = await supabase.from("transactions").insert(transaction).select().single()

    if (error) {
      console.error("Error creating transaction:", error)
      return null
    }
    return data
  },

  async getUserTransactions(userId: string): Promise<(Transaction & { artist: Artist })[]> {
    const { data, error } = await supabase
      .from("transactions")
      .select(`
        *,
        artist:artists(*)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching transactions:", error)
      return []
    }
    return data || []
  },

  async getUserWatchlist(userId: string): Promise<(WatchlistItem & { artist: Artist })[]> {
    const { data, error } = await supabase
      .from("watchlist")
      .select(`
        *,
        artist:artists(*)
      `)
      .eq("user_id", userId)

    if (error) {
      console.error("Error fetching watchlist:", error)
      return []
    }
    return data || []
  },

  async addToWatchlist(userId: string, artistId: string): Promise<void> {
    await supabase.from("watchlist").insert({ user_id: userId, artist_id: artistId })
  },

  async removeFromWatchlist(userId: string, artistId: string): Promise<void> {
    await supabase.from("watchlist").delete().eq("user_id", userId).eq("artist_id", artistId)
  },

  async createLastFmProfile(profile: Database["public"]["Tables"]["lastfm_profiles"]["Insert"]): Promise<void> {
    await supabaseAdmin.from("lastfm_profiles").upsert(profile)
  },

  async getLastFmProfile(userId: string): Promise<LastFmProfile | null> {
    const { data, error } = await supabase.from("lastfm_profiles").select("*").eq("user_id", userId).single()

    if (error) return null
    return data
  },

  async getPublishedNews(): Promise<(NewsArticle & { artist?: Artist })[]> {
    const { data, error } = await supabase
      .from("news")
      .select(`
        *,
        artist:artists(*)
      `)
      .eq("published", true)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching news:", error)
      return []
    }
    return data || []
  },

  async getAllNews(): Promise<(NewsArticle & { artist?: Artist })[]> {
    const { data, error } = await supabaseAdmin
      .from("news")
      .select(`
        *,
        artist:artists(*)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching all news:", error)
      return []
    }
    return data || []
  },

  async createNews(news: Database["public"]["Tables"]["news"]["Insert"]): Promise<NewsArticle | null> {
    const { data, error } = await supabaseAdmin.from("news").insert(news).select().single()

    if (error) {
      console.error("Error creating news:", error)
      return null
    }
    return data
  },

  async updateNews(id: string, updates: Database["public"]["Tables"]["news"]["Update"]): Promise<NewsArticle | null> {
    const { data, error } = await supabaseAdmin
      .from("news")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating news:", error)
      return null
    }
    return data
  },

  async deleteNews(id: string): Promise<void> {
    await supabaseAdmin.from("news").delete().eq("id", id)
  },

  async recordPriceHistory(artistId: string, price: number, volume: number): Promise<void> {
    await supabaseAdmin.from("price_history").insert({
      artist_id: artistId,
      price,
      volume,
    })
  },

  async getPriceHistory(artistId: string, days = 30): Promise<PriceHistory[]> {
    const { data, error } = await supabase
      .from("price_history")
      .select("*")
      .eq("artist_id", artistId)
      .gte("recorded_at", new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order("recorded_at", { ascending: true })

    if (error) {
      console.error("Error fetching price history:", error)
      return []
    }
    return data || []
  },

  async getLeaderboard(): Promise<
    Array<{
      user: User
      portfolioValue: number
      totalReturn: number
      totalReturnPercent: number
    }>
  > {
    //i am going insane idk what im doing anymore
    const { data: users, error } = await supabase
      .from("users")
      .select("*")
      .eq("lastfm_verified", true)
      .order("total_scrobbles", { ascending: false })
      .limit(50)

    if (error || !users) return []

    const leaderboard = []

    for (const user of users) {
      const positions = await this.getUserPositions(user.id)
      const portfolioValue = positions.reduce((total, pos) => {
        return total + pos.shares * pos.artist.current_price
      }, 0)

      const totalInvested = positions.reduce((total, pos) => {
        return total + pos.total_invested
      }, 0)

      const totalReturn = portfolioValue - totalInvested
      const totalReturnPercent = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0

      leaderboard.push({
        user,
        portfolioValue: portfolioValue + user.balance,
        totalReturn,
        totalReturnPercent,
      })
    }

    return leaderboard.sort((a, b) => b.totalReturnPercent - a.totalReturnPercent)
  },
}