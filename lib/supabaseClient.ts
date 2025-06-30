// scripts/testConnection.cjs

import { createClient } from "@supabase/supabase-js";
require("dotenv").config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ ENV tidak terdeteksi. Cek file .env kamu.");
  process.exit(1);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  const { data, error } = await supabase.from("users").select("*").limit(1);

  if (error) {
    console.error("❌ Gagal koneksi ke Supabase:", error.message);
  } else {
    console.log("✅ Koneksi Supabase berhasil. Data contoh:", data);
  }
}

testConnection();
