import { createClient } from "@supabase/supabase-js"

// These must be configured in Vercel / `.env.local`
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "❌ Missing Supabase environment variables. " + "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
  )
}

// Export a singleton client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Optional connectivity check (runs only on the server in dev)
if (process.env.NODE_ENV !== "production" && typeof window === "undefined") {
  ;(async () => {
    const { data, error } = await supabase.from("users").select("*").limit(1)
    if (error) {
      console.error("❌ Supabase connection failed:", error.message)
    } else {
      console.log("✅ Supabase connection OK. Sample:", data)
    }
  })()
}
