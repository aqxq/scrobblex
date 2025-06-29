interface User {
  id: string
  email: string
  display_name: string
  lastfm_username?: string
  lastfm_verified: boolean
  balance: number
  is_admin: boolean
  created_at: string
}

interface LastFmProfile {
  user_id: string
  lastfm_username: string
  access_token: string
  profile_data: any
}

interface VerificationChallenge {
  user_id: string
  song_name: string
  artist_name: string
  challenge_token: string
  expires_at: string
}

interface Position {
  id: string
  user_id: string
  artist_name: string
  shares: number
  average_price: number
  current_price: number
}

interface Transaction {
  id: string
  user_id: string
  artist_name: string
  type: "buy" | "sell"
  shares: number
  price: number
  total: number
  timestamp: string
}

const users: User[] = []
const lastfmProfiles: LastFmProfile[] = []
const verificationChallenges: VerificationChallenge[] = []
const positions: Position[] = []
const transactions: Transaction[] = []

export const db = {
  async createUser(userData: Omit<User, "id" | "created_at">): Promise<User> {
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      ...userData,
      created_at: new Date().toISOString(),
    }
    users.push(user)
    return user
  },

  async getUserById(id: string): Promise<User | null> {
    return users.find((u) => u.id === id) || null
  },

  async getUserByEmail(email: string): Promise<User | null> {
    return users.find((u) => u.email === email) || null
  },

  async getUserByLastFm(username: string): Promise<User | null> {
    return users.find((u) => u.lastfm_username === username) || null
  },

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const index = users.findIndex((u) => u.id === id)
    if (index === -1) return null

    users[index] = { ...users[index], ...updates }
    return users[index]
  },

  async createLastFmProfile(profile: LastFmProfile): Promise<void> {
    const existingIndex = lastfmProfiles.findIndex((p) => p.user_id === profile.user_id)
    if (existingIndex !== -1) {
      lastfmProfiles[existingIndex] = profile
    } else {
      lastfmProfiles.push(profile)
    }
  },

  async getLastFmProfile(userId: string): Promise<LastFmProfile | null> {
    return lastfmProfiles.find((p) => p.user_id === userId) || null
  },

  async createVerificationChallenge(challenge: VerificationChallenge): Promise<void> {
    const index = verificationChallenges.findIndex((c) => c.user_id === challenge.user_id)
    if (index !== -1) {
      verificationChallenges.splice(index, 1)
    }
    verificationChallenges.push(challenge)
  },

  async getVerificationChallenge(token: string): Promise<VerificationChallenge | null> {
    return verificationChallenges.find((c) => c.challenge_token === token) || null
  },

  async deleteVerificationChallenge(token: string): Promise<void> {
    const index = verificationChallenges.findIndex((c) => c.challenge_token === token)
    if (index !== -1) {
      verificationChallenges.splice(index, 1)
    }
  },

  async getUserPositions(userId: string): Promise<Position[]> {
    return positions.filter((p) => p.user_id === userId)
  },

  async getPosition(userId: string, artistName: string): Promise<Position | null> {
    return positions.find((p) => p.user_id === userId && p.artist_name === artistName) || null
  },

  async updatePosition(userId: string, artistName: string, shares: number, averagePrice: number): Promise<void> {
    const index = positions.findIndex((p) => p.user_id === userId && p.artist_name === artistName)
    if (index !== -1) {
      positions[index].shares = shares
      positions[index].average_price = averagePrice
    } else {
      positions.push({
        id: Math.random().toString(36).substr(2, 9),
        user_id: userId,
        artist_name: artistName,
        shares,
        average_price: averagePrice,
        current_price: averagePrice,
      })
    }
  },

  async createTransaction(transaction: Omit<Transaction, "id" | "timestamp">): Promise<Transaction> {
    const newTransaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      ...transaction,
      timestamp: new Date().toISOString(),
    }
    transactions.push(newTransaction)
    return newTransaction
  },

  async getUserTransactions(userId: string): Promise<Transaction[]> {
    return transactions
      .filter((t) => t.user_id === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  },
}
