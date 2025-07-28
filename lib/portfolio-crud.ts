import { supabase } from "./supabaseClient"
import type { Project } from "./data"

// Get all portfolio projects
export async function getAllProjects() {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Failed to fetch projects:", error.message);
    throw error;
  }

  return data;
}

// Get a single portfolio project by ID
export async function getProjectById(id: string): Promise<Project | null> {
  const { data, error } = await supabase.from("projects").select("*, clients(name)").eq("id", id).single()
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
export async function updateProject(id: string, projectData: Omit<Project, "id">): Promise<Project | null> {
  const { data, error } = await supabase
    .from("projects")
    .update({
      ...projectData,
      coachingImageUrl: projectData.coachingImageUrl || "/placeholder.svg",
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
