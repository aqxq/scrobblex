import jwt from "jsonwebtoken"
import { config } from "../config/environment.js"
import { supabase } from "../config/database.js"
import { logger } from "../utils/logger.js"

export const authenticateToken = async (req, res, next) => {
  try {
    const token = req.cookies.auth_token || req.headers.authorization?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({ error: "Access token required" })
    }

    const decoded = jwt.verify(token, config.JWT_SECRET)
    const { data: user, error } = await supabase
      .from("users")
      .select("id, lastfm_username, lastfm_verified, is_admin")
      .eq("id", decoded.userId)
      .single()

    if (error || !user) {
      return res.status(401).json({ error: "Invalid token" })
    }

    req.user = {
      userId: user.id,
      lastfmUsername: user.lastfm_username,
      verified: user.lastfm_verified,
      isAdmin: user.is_admin,
    }

    next()
  } catch (error) {
    logger.error("Authentication error:", error)
    res.status(401).json({ error: "Invalid token" })
  }
}

export const requireAdmin = (req, res, next) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: "Admin access required" })
  }
  next()
}