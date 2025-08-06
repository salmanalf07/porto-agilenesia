import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { supabase } from "./supabaseClient"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// File upload utilities for Supabase Storage
export async function uploadImageToSupabase(file: File, bucket = "project-images"): Promise<string | null> {
  try {
    // Generate unique filename
    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `projects/${fileName}`

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      console.error("Error uploading file:", error)
      return null
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(filePath)

    return publicUrl
  } catch (error) {
    console.error("Error in uploadImageToSupabase:", error)
    return null
  }
}

export async function deleteImageFromSupabase(url: string, bucket = "project-images"): Promise<boolean> {
  try {
    // Extract file path from URL
    const urlParts = url.split("/")
    const fileName = urlParts[urlParts.length - 1]
    const filePath = `projects/${fileName}`

    const { error } = await supabase.storage.from(bucket).remove([filePath])

    if (error) {
      console.error("Error deleting file:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error in deleteImageFromSupabase:", error)
    return false
  }
}

export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  // Check file type
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: "File type not supported. Please use JPG, PNG, GIF, or WebP.",
    }
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024 // 5MB in bytes
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: "File size too large. Maximum size is 5MB.",
    }
  }

  return { isValid: true }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}
