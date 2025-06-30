import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { signJWT } from "@/lib/auth-server"

const LASTFM_API_KEY = process.env.NEXT_PUBLIC_LASTFM_API_KEY!
const LASTFM_SECRET = process.env.LASTFM_SECRET!

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get("token")

  if (!token) {
    console.error("No token provided in callback")
    return NextResponse.redirect(new URL("/login?error=no_token", request.url))
  }

  try {
    const sessionResponse = await fetch(
      `https://ws.audioscrobbler.com/2.0/?method=auth.getSession&api_key=${LASTFM_API_KEY}&token=${token}&api_sig=${generateApiSig(
        {
          method: "auth.getSession",
          api_key: LASTFM_API_KEY,
          token,
        },
      )}&format=json`,
    )

    const sessionData = await sessionResponse.json()

    if (sessionData.error) {
      console.error("Last.fm session error:", sessionData.error, sessionData.message)
      return NextResponse.redirect(new URL("/login?error=lastfm_session", request.url))
    }

    const { session } = sessionData
    const { name: username, key: sessionKey } = session

    const userInfoResponse = await fetch(
      `https://ws.audioscrobbler.com/2.0/?method=user.getInfo&user=${username}&api_key=${LASTFM_API_KEY}&format=json`,
    )

    const userInfoData = await userInfoResponse.json()
    const userInfo = userInfoData.user

    const { data: existingUser, error: fetchError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("lastfm_username", username)
      .single()

    let user

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Database error:", fetchError)
      return NextResponse.redirect(new URL("/login?error=database", request.url))
    }

    if (existingUser) {
      const { data: updatedUser, error: updateError } = await supabaseAdmin
        .from("users")
        .update({
          lastfm_verified: true,
          profile_image_url: userInfo.image?.[2]?.["#text"] || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingUser.id)
        .select()
        .single()

      if (updateError) {
        console.error("Error updating user:", updateError)
        return NextResponse.redirect(new URL("/login?error=update_user", request.url))
      }

      user = updatedUser

      await supabaseAdmin.from("lastfm_profiles").upsert({
        user_id: user.id,
        lastfm_username: username,
        session_key: sessionKey,
        profile_data: userInfo,
        updated_at: new Date().toISOString(),
      })
    } else {
      const { data: newUser, error: createError } = await supabaseAdmin
        .from("users")
        .insert({
          display_name: userInfo.realname || username,
          lastfm_username: username,
          lastfm_verified: true,
          profile_image_url: userInfo.image?.[2]?.["#text"] || null,
          balance: 10000.0,
          scrobble_coins: 0,
          total_scrobbles: Number.parseInt(userInfo.playcount) || 0,
        })
        .select()
        .single()

      if (createError) {
        console.error("Error creating user:", createError)
        return NextResponse.redirect(new URL("/login?error=create_user", request.url))
      }

      user = newUser

      await supabaseAdmin.from("lastfm_profiles").insert({
        user_id: user.id,
        lastfm_username: username,
        session_key: sessionKey,
        profile_data: userInfo,
      })
    }

    const jwtToken = signJWT({
      userId: user.id,
      username: user.lastfm_username,
      displayName: user.display_name,
      lastfmVerified: user.lastfm_verified,
      isAdmin: user.is_admin,
    })

    const response = NextResponse.redirect(new URL("/", request.url))
    response.cookies.set("auth-token", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Callback error:", error)
    return NextResponse.redirect(new URL("/login?error=callback", request.url))
  }
}

function generateApiSig(params: Record<string, string>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}${params[key]}`)
    .join("")

  const crypto = require("crypto")
  return crypto
    .createHash("md5")
    .update(sortedParams + LASTFM_SECRET)
    .digest("hex")
}