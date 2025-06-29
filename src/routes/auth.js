import express from "express"
import jwt from "jsonwebtoken"
import { config } from "../config/environment.js"
import { lastfmService } from "../services/lastfm.js"
import { supabase } from "../config/database.js"
import { logger } from "../utils/logger.js"
import { authenticateToken } from "../middleware/auth.js"

const router = express.Router()

router.get("/lastfm", async (req, res) => {
  try {
    logger.info("Starting Last.fm OAuth flow", { ip: req.ip })

    const token = await lastfmService.getToken()

    const authUrl = lastfmService.getAuthUrl(token)

    res.cookie("lastfm_token", token, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      maxAge: 10 * 60 * 1000, 
      sameSite: "lax"
    })

    logger.info("Last.fm OAuth flow initiated", { 
      token: token.substring(0, 8) + "...",
      authUrl: authUrl.substring(0, 50) + "..."
    })

    res.redirect(authUrl)
  } catch (error) {
    logger.error("Failed to start Last.fm OAuth flow", {
      error: error.message,
      stack: error.stack,
      ip: req.ip
    })

    res.status(500).json({ 
      error: "Failed to start authentication",
      code: "OAUTH_START_FAILED"
    })
  }
})

router.get("/lastfm/callback", async (req, res) => {
  try {
    const token = req.cookies.lastfm_token

    if (!token) {
      logger.warn("OAuth callback missing token", { ip: req.ip })
      return res.redirect(`${config.FRONTEND_URL}/login?error=missing_token`)
    }

    logger.info("Processing Last.fm OAuth callback", { 
      token: token.substring(0, 8) + "...",
      ip: req.ip
    })

    const session = await lastfmService.getSession(token)

    const userInfo = await lastfmService.getUserInfo(session.key)

    logger.info("Last.fm user authenticated", {
      username: userInfo.name,
      realname: userInfo.realname,
      country: userInfo.country
    })

    const { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .eq("lastfm_username", userInfo.name)
      .single()

    let user

    if (existingUser) {

      const { data: updatedUser, error } = await supabase
        .from("users")
        .update({
          display_name: userInfo.realname || userInfo.name,
          lastfm_verified: true,
          updated_at: new Date().toISOString()
        })
        .eq("id", existingUser.id)
        .select()
        .single()

      if (error) {
        logger.error("Failed to update existing user", {
          error: error.message,
          userId: existingUser.id
        })
        throw error
      }

      user = updatedUser
      logger.info("Updated existing user", { userId: user.id })
    } else {

      const { data: newUser, error } = await supabase
        .from("users")
        .insert({
          lastfm_username: userInfo.name,
          display_name: userInfo.realname || userInfo.name,
          balance: 10000.00, 
          lastfm_verified: true,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        logger.error("Failed to create new user", {
          error: error.message,
          username: userInfo.name
        })
        throw error
      }

      user = newUser
      logger.info("Created new user", { 
        userId: user.id,
        username: user.lastfm_username
      })
    }

    await supabase.from("lastfm_profiles").upsert({
      user_id: user.id,
      lastfm_username: userInfo.name,
      session_key: session.key,
      profile_data: userInfo,
      updated_at: new Date().toISOString()
    })

    logger.info("Updated Last.fm profile data", { userId: user.id })

    const jwtToken = jwt.sign(
      {
        userId: user.id,
        lastfmUsername: user.lastfm_username,
        verified: user.lastfm_verified
      },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN }
    )

    res.clearCookie("lastfm_token")

    res.cookie("auth_token", jwtToken, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, 
      sameSite: "lax"
    })

    logger.info("User authentication completed", {
      userId: user.id,
      username: user.lastfm_username,
      tokenExpiry: config.JWT_EXPIRES_IN
    })

    res.redirect(`${config.FRONTEND_URL}?auth=success`)
  } catch (error) {
    logger.error("OAuth callback failed", {
      error: error.message,
      stack: error.stack,
      ip: req.ip
    })

    res.clearCookie("lastfm_token")
    res.redirect(`${config.FRONTEND_URL}/login?error=auth_failed`)
  }
})

router.get("/me", authenticateToken, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select(`
        *,
        lastfm_profiles (
          lastfm_username,
          profile_data,
          last_sync
        )
      `)
      .eq("id", req.user.userId)
      .single()

    if (error || !user) {
      logger.error("Failed to get user profile", {
        error: error?.message,
        userId: req.user.userId
      })
      return res.status(404).json({ 
        error: "User not found",
        code: "USER_NOT_FOUND"
      })
    }

    logger.debug("Retrieved user profile", { 
      userId: user.id,
      username: user.lastfm_username
    })

    res.json({
      id: user.id,
      lastfm_username: user.lastfm_username,
      display_name: user.display_name,
      balance: user.balance,
      lastfm_verified: user.lastfm_verified,
      is_admin: user.is_admin,
      created_at: user.created_at,
      profile: user.lastfm_profiles?.[0]?.profile_data || null,
      last_sync: user.lastfm_profiles?.[0]?.last_sync || null
    })
  } catch (error) {
    logger.error("Error getting user profile", {
      error: error.message,
      userId: req.user.userId
    })

    res.status(500).json({ 
      error: "Failed to get user information",
      code: "PROFILE_ERROR"
    })
  }
})

router.post("/logout", (req, res) => {
  const userId = req.user?.userId

  res.clearCookie("auth_token")

  logger.info("User logged out", { 
    userId: userId,
    ip: req.ip
  })

  res.json({ 
    message: "Logged out successfully",
    success: true
  })
})

router.post("/refresh", authenticateToken, async (req, res) => {
  try {
    const { data: user } = await supabase
      .from("users")
      .select("id, lastfm_username, lastfm_verified")
      .eq("id", req.user.userId)
      .single()

    if (!user) {
      return res.status(404).json({ 
        error: "User not found",
        code: "USER_NOT_FOUND"
      })
    }

    const newToken = jwt.sign(
      {
        userId: user.id,
        lastfmUsername: user.lastfm_username,
        verified: user.lastfm_verified
      },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN }
    )

    res.cookie("auth_token", newToken, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, 
      sameSite: "lax"
    })

    logger.info("Token refreshed", { 
      userId: user.id,
      username: user.lastfm_username
    })

    res.json({ 
      message: "Token refreshed successfully",
      success: true
    })
  } catch (error) {
    logger.error("Token refresh failed", {
      error: error.message,
      userId: req.user.userId
    })

    res.status(500).json({ 
      error: "Token refresh failed",
      code: "REFRESH_ERROR"
    })
  }
})

export default router