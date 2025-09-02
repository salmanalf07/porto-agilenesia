import { supabase } from "./supabaseClient"
import { deleteImageFromSupabase } from "./utils"
import type { Project } from "./data"

// Get all portfolio projects
export async function getAllProjects() {
  const { data, error } = await supabase.from("projects").select("*").order("lastUpdated", { ascending: false })

  if (error) {
    console.error("❌ Failed to fetch projects:", error.message)
    throw error
  }

  return data
}

// Get published projects only (for public display)
export async function getPublishedProjects() {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("status", "published")
    .order("lastUpdated", { ascending: false })

  if (error) {
    console.error("❌ Failed to fetch published projects:", error.message)
    throw error
  }

  return data
}

// Get a single portfolio project by ID
export async function getProjectById(id: string): Promise<Project | null> {
  const { data, error } = await supabase.from("projects").select("*, clients(id, name, logoUrl)").eq("id", id).single()

  if (error) {
    console.error("Error fetching project by ID:", error)
    return null
  }
  return data as Project
}

// Create a new portfolio project
export async function createProject(project: any) {
  // Prepare data for database
  const projectData = {
    title: project.title,
    clientId: project.clientId === "none" ? null : project.clientId,
    clientName: project.clientName || "",
    clientLogoUrl: project.clientLogoUrl || "",
    category: project.category,
    duration: project.duration,
    description: project.description,
    status: project.status || "draft",
    products: JSON.stringify(project.products || []),
    coachingImageUrl: project.coachingImageUrl || "",
    galleryImages: JSON.stringify(project.galleryImages || []),
    squad: JSON.stringify(project.squad || []),
    agilenesiaSquad: JSON.stringify(project.agilenesiaSquad || []),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
  }

  const { data, error } = await supabase.from("projects").insert([projectData]).select().single()

  if (error) {
    console.error("❌ Failed to insert project:", error.message)
    throw error
  }

  return data
}

// Update an existing portfolio project
export async function updateProject(id: string, projectData: any): Promise<Project | null> {
  try {
    console.log("🔄 Starting project update for ID:", id)
    
    // Get current project to handle image cleanup
    const currentProject = await getProjectById(id)
    
    if (!currentProject) {
      console.error("❌ Current project not found")
      return null
    }

    console.log("📄 Current project data:", currentProject)

    // Prepare update data
    const updateData = {
      title: projectData.title,
      clientId: projectData.clientId === "none" ? null : projectData.clientId,
      clientName: projectData.clientName || "",
      clientLogoUrl: projectData.clientLogoUrl || "",
      category: projectData.category,
      duration: projectData.duration,
      description: projectData.description,
      status: projectData.status,
      products: JSON.stringify(projectData.products || []),
      coachingImageUrl: projectData.coachingImageUrl || "",
      galleryImages: JSON.stringify(projectData.galleryImages || []),
      squad: JSON.stringify(projectData.squad || []),
      agilenesiaSquad: JSON.stringify(projectData.agilenesiaSquad || []),
      updated_at: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    }

    console.log("📝 Update data prepared:", updateData)

    // Update the project in database
    const { data, error } = await supabase.from("projects").update(updateData).eq("id", id).select().single()

    if (error) {
      console.error("❌ Error updating project:", error)
      return null
    }

    console.log("✅ Project updated successfully:", data)

    // Clean up old images after successful update
    try {
      console.log("🧹 Starting image cleanup...")
      
      // Parse old gallery images
      let oldGalleryImages: any[] = []
      if (typeof currentProject.galleryImages === "string") {
        try {
          oldGalleryImages = JSON.parse(currentProject.galleryImages)
        } catch (e) {
          console.error("Error parsing old gallery images:", e)
        }
      } else if (Array.isArray(currentProject.galleryImages)) {
        oldGalleryImages = currentProject.galleryImages
      }

      // Parse new gallery images
      let newGalleryImages: any[] = []
      if (Array.isArray(projectData.galleryImages)) {
        newGalleryImages = projectData.galleryImages
      }

      console.log("🖼️ Old gallery images:", oldGalleryImages)
      console.log("🖼️ New gallery images:", newGalleryImages)

      // Extract URLs from old and new images
      const oldUrls = oldGalleryImages
        .map((img) => (typeof img === "string" ? img : img?.url))
        .filter(Boolean)
      
      const newUrls = newGalleryImages
        .map((img) => (typeof img === "string" ? img : img?.url))
        .filter(Boolean)

      console.log("🔗 Old URLs:", oldUrls)
      console.log("🔗 New URLs:", newUrls)

      // Find images that were removed (exist in old but not in new)
      const removedUrls = oldUrls.filter((url) => !newUrls.includes(url))
      
      console.log("🗑️ URLs to be removed:", removedUrls)

      // Delete removed images from storage
      for (const url of removedUrls) {
        if (url && url.includes("supabase")) {
          console.log("🗑️ Deleting image:", url)
          const deleteResult = await deleteImageFromSupabase(url)
          console.log("🗑️ Delete result:", deleteResult)
        }
      }

      // Also check coaching image (main image)
      const oldCoachingImage = currentProject.coachingImageUrl
      const newCoachingImage = projectData.coachingImageUrl

      if (
        oldCoachingImage &&
        oldCoachingImage !== newCoachingImage &&
        oldCoachingImage.includes("supabase")
      ) {
        console.log("🗑️ Deleting old coaching image:", oldCoachingImage)
        const deleteResult = await deleteImageFromSupabase(oldCoachingImage)
        console.log("🗑️ Coaching image delete result:", deleteResult)
      }

      console.log("✅ Image cleanup completed")
    } catch (cleanupError) {
      console.error("⚠️ Error during image cleanup (non-critical):", cleanupError)
      // Don't fail the update if cleanup fails
    }

    return data as Project
  } catch (error) {
    console.error("❌ Error in updateProject:", error)
    return null
  }
}

// Delete a portfolio project
export async function deleteProject(id: string): Promise<boolean> {
  try {
    console.log("🗑️ Starting project deletion for ID:", id)
    
    // Get project data first to clean up images
    const project = await getProjectById(id)

    if (!project) {
      console.error("❌ Project not found for deletion")
      return false
    }

    console.log("📄 Project to delete:", project)

    // Delete coaching image (main image)
    if (project.coachingImageUrl && project.coachingImageUrl.includes("supabase")) {
      console.log("🗑️ Deleting coaching image:", project.coachingImageUrl)
      const deleteResult = await deleteImageFromSupabase(project.coachingImageUrl)
      console.log("🗑️ Coaching image delete result:", deleteResult)
    }

    // Delete gallery images
    let galleryImages: any[] = []
    if (typeof project.galleryImages === "string") {
      try {
        galleryImages = JSON.parse(project.galleryImages)
      } catch (e) {
        console.error("Error parsing gallery images for deletion:", e)
      }
    } else if (Array.isArray(project.galleryImages)) {
      galleryImages = project.galleryImages
    }

    console.log("🖼️ Gallery images to delete:", galleryImages)

    for (const image of galleryImages) {
      const url = typeof image === "string" ? image : image?.url
      if (url && url.includes("supabase")) {
        console.log("🗑️ Deleting gallery image:", url)
        const deleteResult = await deleteImageFromSupabase(url)
        console.log("🗑️ Gallery image delete result:", deleteResult)
      }
    }

    // Delete project record from database
    console.log("🗑️ Deleting project record from database...")
    const { error } = await supabase.from("projects").delete().eq("id", id)

    if (error) {
      console.error("❌ Error deleting project record:", error)
      return false
    }

    console.log("✅ Project deleted successfully")
    return true
  } catch (error) {
    console.error("❌ Error in deleteProject:", error)
    return false
  }
}
