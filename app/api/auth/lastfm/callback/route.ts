import { type NextRequest, NextResponse } from "next/server"
import { lastfmAPI } from "@/lib/lastfm"
import { supabaseAdmin } from "@/lib/supabase"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET!

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      console.error("No token provided in callback")
      return NextResponse.redirect(new URL("/login?error=no_token", request.url))
    }

    console.log("Processing Last.fm callback with token:", token.substring(0, 10) + "...")

    const session = await lastfmAPI.getSession(token)
    if (!session) {
      console.error("Failed to get Last.fm session")
      return NextResponse.redirect(new URL("/login?error=invalid_token", request.url))
    }

    console.log("Got Last.fm session for user:", session.name)

    const userInfo = await lastfmAPI.getUserInfo(session.name)
    if (!userInfo) {
      console.error("Failed to get user info from Last.fm")
      return NextResponse.redirect(new URL("/login?error=user_info_failed", request.url))
    }

    console.log("Last.fm user info:", {
      name: userInfo.name,
      realname: userInfo.realname,
      playcount: userInfo.playcount,
      country: userInfo.country,
    })

    const { data: existingUser } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("lastfm_username", session.name)
      .single()

    let user
    if (existingUser) {
      const { data: updatedUser, error } = await supabaseAdmin
        .from("users")
        .update({
          total_scrobbles: Number.parseInt(userInfo.playcount) || 0,
          scrobble_coins: Number.parseInt(userInfo.playcount) || 0,
          profile_image_url: userInfo.image?.[2]?.["#text"] || userInfo.image?.[1]?.["#text"],
          lastfm_verified: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingUser.id)
        .select()
        .single()

      if (error) {
        console.error("Error updating user:", error)
        return NextResponse.redirect(new URL("/login?error=database_error", request.url))
      }

      user = updatedUser
    } else {
      const { data: newUser, error } = await supabaseAdmin
        .from("users")
        .insert({
          display_name: userInfo.realname || userInfo.name,
          lastfm_username: session.name,
          lastfm_verified: true,
          balance: 10000.0,
          scrobble_coins: Number.parseInt(userInfo.playcount) || 0,
          total_scrobbles: Number.parseInt(userInfo.playcount) || 0,
          profile_image_url: userInfo.image?.[2]?.["#text"] || userInfo.image?.[1]?.["#text"],
          is_admin: false,
        })
        .select()
        .single()

      if (error) {
        console.error("Error creating user:", error)
        return NextResponse.redirect(new URL("/login?error=database_error", request.url))
      }

      user = newUser
    }

    await supabaseAdmin.from("lastfm_profiles").upsert(
      {
        user_id: user.id,
        lastfm_username: session.name,
        session_key: session.key,
        profile_data: userInfo,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      },
    )

    const jwtToken = jwt.sign(
      {
        userId: user.id,
        username: user.lastfm_username,
        displayName: user.display_name,
      },
      JWT_SECRET,
      { expiresIn: "7d" },
    )

    console.log("Authentication successful for user:", user.display_name)

    const response = NextResponse.redirect(new URL("/", request.url))
    response.cookies.set("auth-token", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  } catch (error) {
    console.error("Last.fm callback error:", error)
    return NextResponse.redirect(new URL("/login?error=server_error", request.url))
  }
}
