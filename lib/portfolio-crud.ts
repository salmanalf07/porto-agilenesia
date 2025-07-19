import { supabase } from "./supabaseClient"
import { v4 as uuidv4 } from "uuid"
import type { Project, ProjectImage, TeamMember } from "./data"

// Helper function to upload a single file to Supabase Storage
async function uploadFile(file: File, folder: string): Promise<string | null> {
  if (!file) return null

  const filePath = `${folder}/${uuidv4()}-${file.name}`
  const { data, error } = await supabase.storage.from("portfolio").upload(filePath, file)

  if (error) {
    console.error(`Error uploading file to ${folder}:`, error)
    return null
  }

  const { data: publicUrlData } = supabase.storage.from("portfolio").getPublicUrl(data.path)
  return publicUrlData.publicUrl
}

// Helper function to delete a single file from Supabase Storage
async function deleteFile(url: string): Promise<void> {
  if (!url || !url.includes("supabase.co")) return // Only delete if it's a Supabase URL

  try {
    const pathSegments = url.split("/")
    const fileName = pathSegments[pathSegments.length - 1]
    // Assuming folder structure like: .../storage/v1/object/public/portfolio/folder_name/file_name
    const folderIndex = pathSegments.indexOf("portfolio") + 1
    const folderPath = pathSegments.slice(folderIndex, pathSegments.length - 1).join("/")
    const filePathToDelete = `${folderPath}/${fileName}`

    const { error } = await supabase.storage.from("portfolio").remove([filePathToDelete])
    if (error) {
      console.error("Error deleting file from storage:", error)
    }
  } catch (e) {
    console.error("Failed to parse URL for deletion:", e)
  }
}

// Get all portfolio projects
export async function getProjects(): Promise<Project[] | null> {
  const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false })
  if (error) {
    console.error("Error fetching projects:", error)
    return null
  }
  return data as Project[]
}

// Get a single portfolio project by ID
export async function getProjectById(id: string): Promise<Project | null> {
  const { data, error } = await supabase.from("projects").select("*").eq("id", id).single()
  if (error) {
    console.error("Error fetching project by ID:", error)
    return null
  }
  return data as Project
}

// Create a new portfolio project
export async function createProject(
  projectData: Omit<
    Project,
    "id" | "created_at" | "updated_at" | "coachingImageUrl" | "galleryImages" | "squad" | "agilenesiaSquad"
  > & {
    coachingThumbnailFile: File | null
    galleryFiles: File[]
    clientSquadFiles: { member: TeamMember; file: File | null }[]
    agilenesiaSquadFiles: { member: TeamMember; file: File | null }[]
  },
): Promise<Project | null> {
  let coachingImageUrl: string | null = null
  if (projectData.coachingThumbnailFile) {
    coachingImageUrl = await uploadFile(projectData.coachingThumbnailFile, "portfolio_thumbnails")
  }

  const galleryImages: ProjectImage[] = []
  for (const file of projectData.galleryFiles) {
    const url = await uploadFile(file, "portfolio_gallery")
    if (url) {
      galleryImages.push({ url, alt: file.name })
    }
  }

  const clientSquad: TeamMember[] = []
  for (const { member, file } of projectData.clientSquadFiles) {
    let avatarUrl = member.avatarUrl || null
    if (file) {
      avatarUrl = await uploadFile(file, "client_squad_avatars")
    }
    clientSquad.push({ ...member, avatarUrl: avatarUrl || "" })
  }

  const agilenesiaSquad: TeamMember[] = []
  for (const { member, file } of projectData.agilenesiaSquadFiles) {
    let avatarUrl = member.avatarUrl || null
    if (file) {
      avatarUrl = await uploadFile(file, "agilenesia_squad_avatars")
    }
    agilenesiaSquad.push({ ...member, avatarUrl: avatarUrl || "" })
  }

  const { data, error } = await supabase
    .from("projects")
    .insert({
      ...projectData,
      coachingImageUrl: coachingImageUrl || "/placeholder.svg",
      galleryImages: galleryImages,
      squad: clientSquad,
      agilenesiaSquad: agilenesiaSquad,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating project:", error)
    return null
  }
  return data as Project
}

// Update an existing portfolio project
export async function updateProject(
  id: string,
  projectData: Omit<Project, "id" | "created_at" | "updated_at"> & {
    coachingThumbnailFile: File | null
    galleryFiles: File[] // New files to upload
    existingGalleryUrls: string[] // URLs of images to keep
    clientSquadFiles: { member: TeamMember; file: File | null }[]
    agilenesiaSquadFiles: { member: TeamMember; file: File | null }[]
  },
): Promise<Project | null> {
  // Fetch current project to compare images for deletion
  const currentProject = await getProjectById(id)
  if (!currentProject) {
    console.error("Project not found for update:", id)
    return null
  }

  // Handle coaching thumbnail update
  let coachingImageUrl: string | null = projectData.coachingImageUrl || null
  if (projectData.coachingThumbnailFile) {
    // Upload new file
    const newUrl = await uploadFile(projectData.coachingThumbnailFile, "portfolio_thumbnails")
    if (newUrl) {
      // Delete old file if it exists and is different
      if (currentProject.coachingImageUrl && currentProject.coachingImageUrl !== newUrl) {
        await deleteFile(currentProject.coachingImageUrl)
      }
      coachingImageUrl = newUrl
    }
  } else if (projectData.coachingImageUrl === null && currentProject.coachingImageUrl) {
    // If coaching image was explicitly cleared in form
    await deleteFile(currentProject.coachingImageUrl)
    coachingImageUrl = null
  }

  // Handle gallery images update
  const finalGalleryImages: ProjectImage[] = []
  // Add existing images that are still in the form
  for (const url of projectData.existingGalleryUrls) {
    finalGalleryImages.push({ url, alt: "Gallery Image" }) // Alt text might need to be fetched or passed
  }
  // Upload new gallery files
  for (const file of projectData.galleryFiles) {
    const url = await uploadFile(file, "portfolio_gallery")
    if (url) {
      finalGalleryImages.push({ url, alt: file.name })
    }
  }
  // Delete old gallery images that are no longer in the form
  if (currentProject.galleryImages) {
    for (const oldImg of currentProject.galleryImages) {
      if (!projectData.existingGalleryUrls.includes(oldImg.url)) {
        await deleteFile(oldImg.url)
      }
    }
  }

  // Handle team member avatars update
  const clientSquad: TeamMember[] = []
  for (const { member, file } of projectData.clientSquadFiles) {
    let avatarUrl = member.avatarUrl || null
    if (file) {
      const newUrl = await uploadFile(file, "client_squad_avatars")
      if (newUrl) {
        // Delete old avatar if it exists and is different
        const oldMember = currentProject.squad?.find((s) => s.name === member.name && s.role === member.role)
        if (oldMember?.avatarUrl && oldMember.avatarUrl !== newUrl) {
          await deleteFile(oldMember.avatarUrl)
        }
        avatarUrl = newUrl
      }
    } else if (member.avatarUrl === null) {
      // If avatar was explicitly cleared
      const oldMember = currentProject.squad?.find((s) => s.name === member.name && s.role === member.role)
      if (oldMember?.avatarUrl) {
        await deleteFile(oldMember.avatarUrl)
      }
      avatarUrl = null
    }
    clientSquad.push({ ...member, avatarUrl: avatarUrl || "" })
  }
  // Delete avatars of removed client squad members
  if (currentProject.squad) {
    for (const oldMember of currentProject.squad) {
      if (
        !projectData.clientSquadFiles.some((m) => m.member.name === oldMember.name && m.member.role === oldMember.role)
      ) {
        if (oldMember.avatarUrl) await deleteFile(oldMember.avatarUrl)
      }
    }
  }

  const agilenesiaSquad: TeamMember[] = []
  for (const { member, file } of projectData.agilenesiaSquadFiles) {
    let avatarUrl = member.avatarUrl || null
    if (file) {
      const newUrl = await uploadFile(file, "agilenesia_squad_avatars")
      if (newUrl) {
        const oldMember = currentProject.agilenesiaSquad?.find((s) => s.name === member.name && s.role === member.role)
        if (oldMember?.avatarUrl && oldMember.avatarUrl !== newUrl) {
          await deleteFile(oldMember.avatarUrl)
        }
        avatarUrl = newUrl
      }
    } else if (member.avatarUrl === null) {
      // If avatar was explicitly cleared
      const oldMember = currentProject.agilenesiaSquad?.find((s) => s.name === member.name && s.role === member.role)
      if (oldMember?.avatarUrl) {
        await deleteFile(oldMember.avatarUrl)
      }
      avatarUrl = null
    }
    agilenesiaSquad.push({ ...member, avatarUrl: avatarUrl || "" })
  }
  // Delete avatars of removed agilenesia squad members
  if (currentProject.agilenesiaSquad) {
    for (const oldMember of currentProject.agilenesiaSquad) {
      if (
        !projectData.agilenesiaSquadFiles.some(
          (m) => m.member.name === oldMember.name && m.member.role === oldMember.role,
        )
      ) {
        if (oldMember.avatarUrl) await deleteFile(oldMember.avatarUrl)
      }
    }
  }

  const { data, error } = await supabase
    .from("projects")
    .update({
      title: projectData.title,
      clientId: projectData.clientId,
      clientName: projectData.clientName,
      clientLogoUrl: projectData.clientLogoUrl,
      category: projectData.category,
      duration: projectData.duration,
      products: projectData.products,
      description: projectData.description,
      coachingImageUrl: coachingImageUrl || "/placeholder.svg", // Ensure it's never null in DB
      galleryImages: finalGalleryImages,
      squad: clientSquad,
      agilenesiaSquad: agilenesiaSquad,
      updated_at: new Date().toISOString(),
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
  const projectToDelete = await getProjectById(id)
  if (!projectToDelete) {
    console.error("Project not found for deletion:", id)
    return false
  }

  // Delete associated images from storage
  if (projectToDelete.coachingImageUrl && projectToDelete.coachingImageUrl !== "/placeholder.svg") {
    await deleteFile(projectToDelete.coachingImageUrl)
  }
  if (projectToDelete.galleryImages) {
    for (const img of projectToDelete.galleryImages) {
      await deleteFile(img.url)
    }
  }
  if (projectToDelete.squad) {
    for (const member of projectToDelete.squad) {
      if (member.avatarUrl) await deleteFile(member.avatarUrl)
    }
  }
  if (projectToDelete.agilenesiaSquad) {
    for (const member of projectToDelete.agilenesiaSquad) {
      if (member.avatarUrl) await deleteFile(member.avatarUrl)
    }
  }

  // Delete project record from database
  const { error } = await supabase.from("projects").delete().eq("id", id)
  if (error) {
    console.error("Error deleting project record:", error)
    return false
  }
  return true
}
