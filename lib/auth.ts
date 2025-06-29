import { cookies } from "next/headers"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export interface JWTPayload {
  userId: string
  email: string
  lastfmUsername?: string
  lastfmVerified: boolean
  isAdmin: boolean
  exp: number
}

export function signJWT(payload: Omit<JWTPayload, "exp">): string {
  const header = { alg: "HS256", typ: "JWT" }
  const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60
  const fullPayload = { ...payload, exp }

  const encodedHeader = btoa(JSON.stringify(header))
  const encodedPayload = btoa(JSON.stringify(fullPayload))

  const signature = btoa(`${encodedHeader}.${encodedPayload}.${JWT_SECRET}`)

  return `${encodedHeader}.${encodedPayload}.${signature}`
}

export function verifyJWT(token: string): JWTPayload | null {
  try {
    const [header, payload, signature] = token.split(".")

    const expectedSignature = btoa(`${header}.${payload}.${JWT_SECRET}`)
    if (signature !== expectedSignature) return null

    const decodedPayload = JSON.parse(atob(payload)) as JWTPayload

    if (decodedPayload.exp < Math.floor(Date.now() / 1000)) return null

    return decodedPayload
  } catch {
    return null
  }
}

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  if (!token) return null

  return verifyJWT(token)
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  })
}

export async function clearAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete("auth-token")
}

