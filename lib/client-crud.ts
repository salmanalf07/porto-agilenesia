import { createClient } from "@supabase/supabase-js"

export interface Client {
  id: string
  name: string
  logoUrl?: string | null
}

/**
 * Re-usable singleton Supabase client (client-side safe because we only
 * invoke it in server-side/browser code that already has env vars).
 */
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

/**
 * Fetch all clients, ordered alphabetically by name.
 * Returns `null` if an error occurs (the caller can handle UI fallback).
 */
export async function getClients(): Promise<Client[] | null> {
  const { data, error } = await supabase.from("clients").select("id, name, logoUrl").order("name", { ascending: true })

  if (error) {
    console.error("getClients() error:", error)
    return null
  }

  return (data ?? []) as Client[]
}
