import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET() {
  try {
    const { data: artists, error } = await supabaseAdmin
      .from("artists")
      .select("*")
      .order("market_cap", { ascending: false })

    if (error) {
      console.error("Error fetching artists:", error)
      return NextResponse.json({ error: "Failed to fetch artists" }, { status: 500 })
    }

    return NextResponse.json({ artists })
  } catch (error) {
    console.error("Artists API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}