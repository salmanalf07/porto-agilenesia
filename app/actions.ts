"use server"

import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import type { User } from "@/lib/data" // Import users and User type
import { supabase } from "@/lib/supabaseClient"
import bcrypt from "bcryptjs"

const SESSION_COOKIE_NAME = "agilenesia_session"

export async function login(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  // Query ke Supabase
  const { data: users, error } = await supabase
    .from("users")
    .select("id, email, password, role, name, status, clientId")
    .eq("email", email)
    .single() // karena hanya ingin ambil 1

  if (error || !users) {
    console.log(`Login failed for: ${email} - not found`)
    return { error: "Email tidak ditemukan" }
  }

  // ✅ Bandingkan password hash
  const isMatch = await bcrypt.compare(password, users.password)

  if (!isMatch) {
    console.log(`Login failed: wrong password`)
    return { error: "Password salah" }
  }

  // Simpan session di cookie dengan data lengkap
  cookies().set(
    SESSION_COOKIE_NAME,
    JSON.stringify({
      id: users.id,
      role: users.role,
      name: users.name,
      email: users.email,
      status: users.status,
      clientId: users.clientId,
      password: users.password, // Include for profile updates
    }),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24,
      path: "/",
    },
  )

  console.log(`✅ Login berhasil: ${email}, role: ${users.role}`)
  redirect("/")
}

export async function logout() {
  cookies().delete(SESSION_COOKIE_NAME)
  console.log("User logged out")
  redirect("/login")
}

export async function getUserSession(): Promise<User | null> {
  const session = cookies().get(SESSION_COOKIE_NAME)?.value
  if (!session) {
    return null
  }
  try {
    const userData = JSON.parse(session)
    // In a real app, you'd validate the session ID against a database
    const { data: users, error } = await supabase
      .from("users")
      .select("id, role, name, email, status, clientId, password, lastUpdated")
      .eq("id", userData.id)
      .eq("role", userData.role)
      .single() // karena hanya ingin ambil 1

    return users || null
  } catch (error) {
    console.error("Failed to parse session cookie:", error)
    cookies().delete(SESSION_COOKIE_NAME) // Clear invalid session
    return null
  }
}
