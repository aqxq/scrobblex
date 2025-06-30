import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "superdupersecretkeylololol"

export interface JWTPayload {
  userId: string
  username: string
  displayName: string
  lastfmVerified: boolean
  isAdmin: boolean
  iat?: number
  exp?: number
}

export function signJWT(payload: Omit<JWTPayload, "iat" | "exp">): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyJWT(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    return decoded
  } catch (error) {
    console.error("JWT verification failed:", error)
    return null
  }
}

export function getTokenFromCookies(): string | null {
  if (typeof document === "undefined") return null

  const cookies = document.cookie.split(";")
  const authCookie = cookies.find((cookie) => cookie.trim().startsWith("auth-token="))

  if (!authCookie) return null

  return authCookie.split("=")[1]
}

export function getCurrentSession(): JWTPayload | null {
  const token = getTokenFromCookies()
  if (!token) return null

  return verifyJWT(token)
}