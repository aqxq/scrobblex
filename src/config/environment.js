import dotenv from "dotenv"

dotenv.config()

export const config = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 5000,
  FRONTEND_URL: process.env.FRONTEND_URL,
  BACKEND_URL: process.env.BACKEND_URL,

  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  LASTFM_API_KEY: process.env.LASTFM_API_KEY,
  LASTFM_API_SECRET: process.env.LASTFM_API_SECRET,
  LASTFM_CALLBACK_URL: `${process.env.BACKEND_URL}/api/auth/lastfm/callback`,
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
}