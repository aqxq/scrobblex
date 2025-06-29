import { createClient } from "@supabase/supabase-js"
import { config } from "./environment.js"

if (!config.SUPABASE_URL || !config.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing Supabase configuration")
}

export const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY)