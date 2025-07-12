import { supabase } from "./supabaseClient"
import type { User } from "./data" // Menggunakan interface User yang sudah ada

/**
 * Mengambil semua data pengguna dari tabel 'users'.
 * @returns Array of User objects or an empty array if an error occurs.
 */
export async function getUsers(): Promise<User[]> {
  const { data, error } = await supabase.from("users").select("*, clients(name)").order("lastUpdated", { ascending: false })
  if (error) {
    console.error("Error fetching users:", error)
    return []
  }
  return data as User[]
}

/**
 * Membuat pengguna baru di tabel 'users'.
 * Catatan: Fungsi ini hanya membuat entri di tabel 'users',
 * TIDAK membuat pengguna di sistem autentikasi Supabase.
 * @param userData Data pengguna yang akan dibuat (tanpa id dan lastUpdated).
 * @returns Objek User yang baru dibuat atau null jika terjadi kesalahan.
 */
export async function createUser(userData: Omit<User, "id" | "lastUpdated">): Promise<User | null> {
  const newUser = {
    ...userData,
    lastUpdated: new Date().toISOString(),
  }
  const { data, error } = await supabase.from("users").insert(newUser).select().single()
  if (error) {
    console.error("Error creating user:", error)
    return null
  }
  return data as User
}

/**
 * Memperbarui data pengguna yang sudah ada di tabel 'users'.
 * @param id ID pengguna yang akan diperbarui.
 * @param userData Data pengguna yang akan diperbarui (parsial, tanpa id dan lastUpdated).
 * @returns Objek User yang diperbarui atau null jika terjadi kesalahan.
 */
export async function updateUser(
  id: string,
  userData: Partial<Omit<User, "id" | "lastUpdated">>,
): Promise<User | null> {
  const updatedData = {
    ...userData,
    lastUpdated: new Date().toISOString(),
  }
  const { data, error } = await supabase.from("users").update(updatedData).eq("id", id).select().single()
  if (error) {
    console.error("Error updating user:", error)
    return null
  }
  return data as User
}

/**
 * Menghapus pengguna dari tabel 'users'.
 * Catatan: Fungsi ini hanya menghapus entri dari tabel 'users',
 * TIDAK menghapus pengguna dari sistem autentikasi Supabase.
 * @param id ID pengguna yang akan dihapus.
 * @returns True jika berhasil dihapus, false jika terjadi kesalahan.
 */
export async function deleteUser(id: string): Promise<boolean> {
  const { error } = await supabase.from("users").delete().eq("id", id)
  if (error) {
    console.error("Error deleting user:", error)
    return false
  }
  return true
}
