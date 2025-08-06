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

    console.log("Uploading file to:", filePath)

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      console.error("Error uploading file:", error)
      return null
    }

    console.log("Upload successful:", data)

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(filePath)

    console.log("Public URL:", publicUrl)
    return publicUrl
  } catch (error) {
    console.error("Error in uploadImageToSupabase:", error)
    return null
  }
}

export async function deleteImageFromSupabase(url: string, bucket = "project-images"): Promise<boolean> {
  try {
    if (!url || !url.includes("supabase")) {
      console.log("URL is not a Supabase storage URL, skipping deletion:", url)
      return true
    }

    // Extract file path from URL
    // URL format: https://project.supabase.co/storage/v1/object/public/bucket/path/filename
    const urlParts = url.split("/")
    const bucketIndex = urlParts.findIndex((part) => part === bucket)
    
    if (bucketIndex === -1) {
      console.error("Could not find bucket in URL:", url)
      return false
    }

    // Get the path after the bucket name
    const pathParts = urlParts.slice(bucketIndex + 1)
    const filePath = pathParts.join("/")

    console.log("Attempting to delete file:", filePath, "from bucket:", bucket)

    const { error } = await supabase.storage.from(bucket).remove([filePath])

    if (error) {
      console.error("Error deleting file:", error)
      return false
    }

    console.log("Successfully deleted file:", filePath)
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

// Helper function to extract file path from Supabase URL
export function extractFilePathFromSupabaseUrl(url: string, bucket = "project-images"): string | null {
  try {
    if (!url || !url.includes("supabase")) {
      return null
    }

    // URL format: https://project.supabase.co/storage/v1/object/public/bucket/path/filename
    const urlParts = url.split("/")
    const bucketIndex = urlParts.findIndex((part) => part === bucket)
    
    if (bucketIndex === -1) {
      return null
    }

    // Get the path after the bucket name
    const pathParts = urlParts.slice(bucketIndex + 1)
    return pathParts.join("/")
  } catch (error) {
    console.error("Error extracting file path:", error)
    return null
  }
}
