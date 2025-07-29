import { supabase } from "./supabaseClient"
import type { Project } from "./data"

// Get all portfolio projects
export async function getAllProjects() {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("lastUpdated", { ascending: true })

  if (error) {
    console.error("❌ Failed to fetch projects:", error.message);
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
  const { data, error } = await supabase
    .from("projects")
    .insert([project])
    .select()
    .single();

  if (error) {
    console.error("❌ Failed to insert project:", error.message);
    throw error;
  }

  return data;
}

// Update an existing portfolio project
// Update an existing portfolio project
export async function updateProject(id: string, projectData: any): Promise<Project | null> {
  // Remove any nested client data and only keep the fields that exist in the projects table
  const {
    clients, // Remove this if it exists
    ...cleanProjectData
  } = projectData

  const { data, error } = await supabase
    .from("projects")
    .update({
      title: cleanProjectData.title,
      clientId: cleanProjectData.clientId,
      clientName: cleanProjectData.clientName,
      clientLogoUrl: cleanProjectData.clientLogoUrl,
      category: cleanProjectData.category,
      duration: cleanProjectData.duration,
      description: cleanProjectData.description,
      status: cleanProjectData.status,
      products: JSON.stringify(cleanProjectData.products || []),
      coachingImageUrl: cleanProjectData.coachingImageUrl || "/placeholder.svg",
      galleryImages: JSON.stringify(cleanProjectData.galleryImages || []),
      squad: JSON.stringify(cleanProjectData.squad || []),
      agilenesiaSquad: JSON.stringify(cleanProjectData.agilenesiaSquad || []),
      updated_at: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating project:", error)
    return null
  }
  return data as Project
}

// Delete a portfolio project
export async function deleteProject(id: string): Promise<boolean> {
  const { error } = await supabase.from("projects").delete().eq("id", id)
  if (error) {
    console.error("Error deleting project record:", error)
    return false
  }
  return true
}
