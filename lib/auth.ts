import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export interface JWTPayload {
  userId: string
  username: string
  displayName: string
  lastfmVerified: boolean
  isAdmin: boolean
}

export function signJWT(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyJWT(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    console.error("JWT verification failed:", error)
    return null
  }
}

export function getCurrentSession(): JWTPayload | null {
  if (typeof window === "undefined") return null

  try {
    const cookies = document.cookie.split(";")
    const authCookie = cookies.find((cookie) => cookie.trim().startsWith("auth-token="))

    if (!authCookie) return null

    const token = authCookie.split("=")[1]
    return verifyJWT(token)
  } catch (error) {
    console.error("Error getting current session:", error)
    return null
  }
}