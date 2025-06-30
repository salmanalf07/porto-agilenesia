import { createClient } from "@supabase/supabase-js"

// Make sure you have these variables set in your Vercel / local environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "❌ Missing Supabase environment variables. " + "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
  )
}

// Export a single client instance so it can be shared across the app
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Optional -- simple connectivity check (runs once at boot/server-cold-start)
if (process.env.NODE_ENV !== "production") {
  ;(async () => {
    const { data, error } = await supabase.from("users").select("*").limit(1)
    if (error) {
      // eslint-disable-next-line no-console
      console.error("❌ Supabase connection failed:", error.message)
    } else {
      // eslint-disable-next-line no-console
      console.log("✅ Supabase connection OK. Sample:", data)
    }
  })()
}
