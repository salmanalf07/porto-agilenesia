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
  // Get current project to handle image cleanup
  const currentProject = await getProjectById(id)

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

  const { data, error } = await supabase.from("projects").update(updateData).eq("id", id).select().single()

  if (error) {
    console.error("Error updating project:", error)
    return null
  }

  // Clean up old images if they were replaced
  if (currentProject) {
    try {
      // Parse old gallery images
      let oldGalleryImages: any[] = []
      if (typeof currentProject.galleryImages === "string") {
        oldGalleryImages = JSON.parse(currentProject.galleryImages)
      } else if (Array.isArray(currentProject.galleryImages)) {
        oldGalleryImages = currentProject.galleryImages
      }

      // Parse new gallery images
      let newGalleryImages: any[] = []
      if (typeof projectData.galleryImages === "string") {
        newGalleryImages = JSON.parse(projectData.galleryImages)
      } else if (Array.isArray(projectData.galleryImages)) {
        newGalleryImages = projectData.galleryImages
      }

      // Find images that were removed
      const oldUrls = oldGalleryImages.map((img) => (typeof img === "string" ? img : img.url)).filter(Boolean)
      const newUrls = newGalleryImages.map((img) => (typeof img === "string" ? img : img.url)).filter(Boolean)
      const removedUrls = oldUrls.filter((url) => !newUrls.includes(url))

      // Delete removed images from storage
      for (const url of removedUrls) {
        if (url && url.includes("supabase")) {
          await deleteImageFromSupabase(url)
        }
      }

      // Also check coaching image
      if (
        currentProject.coachingImageUrl &&
        currentProject.coachingImageUrl !== projectData.coachingImageUrl &&
        currentProject.coachingImageUrl.includes("supabase")
      ) {
        await deleteImageFromSupabase(currentProject.coachingImageUrl)
      }
    } catch (cleanupError) {
      console.error("Error cleaning up old images:", cleanupError)
      // Don't fail the update if cleanup fails
    }
  }

  return data as Project
}

// Delete a portfolio project
export async function deleteProject(id: string): Promise<boolean> {
  try {
    // Get project data first to clean up images
    const project = await getProjectById(id)

    if (project) {
      // Delete coaching image
      if (project.coachingImageUrl && project.coachingImageUrl.includes("supabase")) {
        await deleteImageFromSupabase(project.coachingImageUrl)
      }

      // Delete gallery images
      let galleryImages: any[] = []
      if (typeof project.galleryImages === "string") {
        galleryImages = JSON.parse(project.galleryImages)
      } else if (Array.isArray(project.galleryImages)) {
        galleryImages = project.galleryImages
      }

      for (const image of galleryImages) {
        const url = typeof image === "string" ? image : image.url
        if (url && url.includes("supabase")) {
          await deleteImageFromSupabase(url)
        }
      }
    }

    // Delete project record
    const { error } = await supabase.from("projects").delete().eq("id", id)

    if (error) {
      console.error("Error deleting project record:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error in deleteProject:", error)
    return false
  }
}
