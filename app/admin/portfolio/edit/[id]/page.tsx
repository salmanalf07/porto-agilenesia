"use client"

import { Badge } from "@/components/ui/badge"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusIcon, SaveIcon, XIcon, Loader2Icon, ArrowLeftIcon } from "lucide-react"
import { ThemeToggleButton } from "@/components/theme-toggle-button"
import { AgilenesiaLogo } from "@/components/agilenesia-logo"
import { FadeInUp } from "@/components/page-transition"
import { getUserSession, logout } from "@/app/actions"
import Link from "next/link"
import { ThumbnailGallery } from "@/components/thumbnail-gallery"
import { ProjectGalleryInput } from "@/components/project-gallery-input"
import { RichTextEditor } from "@/components/rich-text-editor"
import { getProjectById, updateProject } from "@/lib/portfolio-crud" // Import CRUD functions
import { useParams } from "next/navigation"
import { getClients } from "@/lib/clients" // Import getClients
import type { Client, TeamMember as ProjectTeamMember, ProjectImage } from "@/lib/data"

interface TeamMemberFormState {
  name: string
  role: string
  avatarFile: File | null
  avatarUrl: string | null // Current URL, either existing or new preview
}

export default function EditPortfolioPage() {
  const { id } = useParams()
  const projectId = Array.isArray(id) ? id[0] : id

  const [currentUser, setCurrentUser] = useState<any>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    clientId: "",
    category: "",
    duration: "",
    products: [] as string[],
    description: "",
    coachingThumbnailFile: null as File | null,
    coachingThumbnailPreviewUrl: null as string | null, // For new file preview or existing URL
    galleryFiles: [] as File[], // New files to upload
    existingGalleryUrls: [] as string[], // URLs of images already in Supabase
  })
  const [clientTeam, setClientTeam] = useState<TeamMemberFormState[]>([])
  const [agilenesiaTeam, setAgilenesiaTeam] = useState<TeamMemberFormState[]>([])
  const [newProduct, setNewProduct] = useState("")

  useEffect(() => {
    const fetchUser = async () => {
      const session = await getUserSession()
      setCurrentUser(session)
    }
    fetchUser()
  }, [])

  const fetchClients = useCallback(async () => {
    const fetchedClients = await getClients()
    if (fetchedClients) {
      setClients(fetchedClients)
    }
  }, [])

  const fetchProject = useCallback(async () => {
    if (!projectId) return

    setLoading(true)
    setError(null)
    const data = await getProjectById(projectId)

    if (!data) {
      setError("Failed to load project data or project not found.")
      setLoading(false)
      return
    }

    setFormData({
      title: data.title,
      clientId: data.clientId || "",
      category: data.category,
      duration: data.duration,
      products: data.products || [],
      description: data.description || "",
      coachingThumbnailFile: null, // No file initially
      coachingThumbnailPreviewUrl: data.coachingImageUrl || null, // Existing URL
      galleryFiles: [], // No new files initially
      existingGalleryUrls: data.galleryImages?.map((img: ProjectImage) => img.url) || [], // Existing URLs
    })

    setClientTeam(
      data.squad?.map((member: ProjectTeamMember) => ({
        name: member.name,
        role: member.role,
        avatarFile: null,
        avatarUrl: member.avatarUrl || null,
      })) || [],
    )
    setAgilenesiaTeam(
      data.agilenesiaSquad?.map((member: ProjectTeamMember) => ({
        name: member.name,
        role: member.role,
        avatarFile: null,
        avatarUrl: member.avatarUrl || null,
      })) || [],
    )
    setLoading(false)
  }, [projectId])

  useEffect(() => {
    fetchClients()
    fetchProject()
  }, [fetchClients, fetchProject])

  const handleAddProduct = () => {
    if (newProduct.trim() !== "" && !formData.products.includes(newProduct.trim())) {
      setFormData((prev) => ({
        ...prev,
        products: [...prev.products, newProduct.trim()],
      }))
      setNewProduct("")
    }
  }

  const handleRemoveProduct = (productToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      products: prev.products.filter((product) => product !== productToRemove),
    }))
  }

  const handleAddTeamMember = (teamType: "client" | "agilenesia") => {
    if (teamType === "client") {
      setClientTeam((prev) => [...prev, { name: "", role: "", avatarFile: null, avatarUrl: null }])
    } else {
      setAgilenesiaTeam((prev) => [...prev, { name: "", role: "", avatarFile: null, avatarUrl: null }])
    }
  }

  const handleRemoveTeamMember = (teamType: "client" | "agilenesia", index: number) => {
    if (teamType === "client") {
      setClientTeam((prev) => prev.filter((_, i) => i !== index))
    } else {
      setAgilenesiaTeam((prev) => prev.filter((_, i) => i !== index))
    }
  }

  const handleTeamMemberChange = (
    teamType: "client" | "agilenesia",
    index: number,
    field: keyof TeamMemberFormState,
    value: any,
  ) => {
    if (teamType === "client") {
      setClientTeam((prev) => prev.map((member, i) => (i === index ? { ...member, [field]: value } : member)))
    } else {
      setAgilenesiaTeam((prev) => prev.map((member, i) => (i === index ? { ...member, [field]: value } : member)))
    }
  }

  const handleDeleteExistingGalleryImage = useCallback((imageUrl: string) => {
    setFormData((prev) => ({
      ...prev,
      existingGalleryUrls: prev.existingGalleryUrls.filter((url) => url !== imageUrl),
    }))
    // Deletion from storage will happen during updateProject call
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (!projectId) {
      setError("Project ID is missing.")
      setIsSubmitting(false)
      return
    }

    const selectedClient = clients.find((c) => c.id === formData.clientId)
    const clientName = selectedClient?.name || "Unknown Client"
    const clientLogoUrl = selectedClient?.logoUrl || "/placeholder.svg"

    const projectData: Parameters<typeof updateProject>[1] = {
      title: formData.title,
      clientId: formData.clientId,
      clientName: clientName,
      clientLogoUrl: clientLogoUrl,
      category: formData.category,
      duration: formData.duration,
      products: formData.products,
      description: formData.description,
      coachingImageUrl: formData.coachingThumbnailPreviewUrl, // Pass current preview URL (can be null if cleared)
      coachingThumbnailFile: formData.coachingThumbnailFile,
      galleryFiles: formData.galleryFiles,
      existingGalleryUrls: formData.existingGalleryUrls,
      clientSquadFiles: clientTeam.map((member) => ({ member, file: member.avatarFile })),
      agilenesiaSquadFiles: agilenesiaTeam.map((member) => ({ member, file: member.avatarFile })),
    }

    const updatedProject = await updateProject(projectId, projectData)

    if (updatedProject) {
      alert("Portfolio item updated successfully!")
      // Re-fetch project data to ensure UI is in sync with DB after update
      fetchProject()
    } else {
      setError("Failed to update portfolio item. Please check console for details.")
    }
    setIsSubmitting(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading project...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="bg-background text-foreground min-h-screen">
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
          <AgilenesiaLogo />
          <nav className="ml-auto flex gap-2 sm:gap-4 items-center">
            {currentUser?.role === "admin" && (
              <>
                <Link href="/admin/users" className="text-sm font-medium hover:text-primary transition-colors">
                  Users
                </Link>
                <Link href="/admin/clients" className="text-sm font-medium hover:text-primary transition-colors">
                  Clients
                </Link>
                <Link href="/admin/portfolio" className="text-sm font-medium text-primary">
                  Portfolio
                </Link>
              </>
            )}
            <ThemeToggleButton />
            {currentUser && (
              <Button
                variant="outline"
                className="border-primary text-primary hover:bg-primary/10 bg-transparent"
                onClick={() => logout()}
              >
                Logout
              </Button>
            )}
          </nav>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8 lg:p-12">
        <FadeInUp>
          <div className="mb-8">
            <Button variant="ghost" size="sm" className="mb-4" asChild>
              <Link href="/admin/portfolio">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Portfolio
              </Link>
            </Button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-title font-heading text-high-contrast mb-2">Edit Portfolio Item</h1>
                <p className="text-body text-medium-contrast">Modify the details of your existing project.</p>
              </div>
              <Button
                type="submit"
                form="portfolio-form"
                className="bg-primary hover:bg-agile-teal-dark text-primary-foreground"
                disabled={isSubmitting}
              >
                <SaveIcon className="h-4 w-4 mr-2" />
                {isSubmitting ? "Saving Changes..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </FadeInUp>

        <FadeInUp delay={0.2}>
          <form id="portfolio-form" onSubmit={handleSubmit} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Project Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="client">Client</Label>
                  <Select
                    value={formData.clientId}
                    onValueChange={(value) => setFormData({ ...formData, clientId: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g., 6 Months (Jan 2024 - Jun 2024)"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="products">Products/Services Involved</Label>
                  <div className="flex space-x-2 mb-2">
                    <Input
                      id="new-product"
                      value={newProduct}
                      onChange={(e) => setNewProduct(e.target.value)}
                      placeholder="Add a product or service"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handleAddProduct()
                        }
                      }}
                    />
                    <Button type="button" onClick={handleAddProduct}>
                      <PlusIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.products.map((product, index) => (
                      <Badge key={index} className="flex items-center gap-1">
                        {product}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 p-0"
                          onClick={() => handleRemoveProduct(product)}
                        >
                          <XIcon className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Project Description</Label>
                  <RichTextEditor
                    value={formData.description}
                    onChange={(html) => setFormData({ ...formData, description: html })}
                    placeholder="Write a detailed description of the project..."
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="coaching-thumbnail">Coaching Thumbnail Image</Label>
                  <ThumbnailGallery
                    value={formData.coachingThumbnailPreviewUrl}
                    onChange={(file, previewUrl) =>
                      setFormData({ ...formData, coachingThumbnailFile: file, coachingThumbnailPreviewUrl: previewUrl })
                    }
                    emptyStateAspectRatioClass="aspect-video"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    This will be the main image displayed for the project.
                  </p>
                </div>
                <div>
                  <Label htmlFor="gallery">Project Gallery Images</Label>
                  <ProjectGalleryInput
                    value={formData.galleryFiles}
                    onChange={(files) => setFormData({ ...formData, galleryFiles: files })}
                    existingImages={formData.existingGalleryUrls}
                    onDeleteExistingImage={handleDeleteExistingGalleryImage}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Add multiple images to showcase the project in detail.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Client Squad</h3>
                  {clientTeam.map((member, index) => (
                    <div key={index} className="flex items-end gap-2 mb-4 border p-3 rounded-md">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-grow">
                        <div>
                          <Label htmlFor={`client-name-${index}`}>Name</Label>
                          <Input
                            id={`client-name-${index}`}
                            value={member.name}
                            onChange={(e) => handleTeamMemberChange("client", index, "name", e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor={`client-role-${index}`}>Role</Label>
                          <Input
                            id={`client-role-${index}`}
                            value={member.role}
                            onChange={(e) => handleTeamMemberChange("client", index, "role", e.target.value)}
                            required
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <Label htmlFor={`client-avatar-${index}`}>Avatar</Label>
                          <ThumbnailGallery
                            value={member.avatarUrl}
                            onChange={(file, previewUrl) => {
                              handleTeamMemberChange("client", index, "avatarFile", file)
                              handleTeamMemberChange("client", index, "avatarUrl", previewUrl)
                            }}
                            emptyStateAspectRatioClass="aspect-square"
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => handleRemoveTeamMember("client", index)}
                        className="shrink-0"
                      >
                        <XIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={() => handleAddTeamMember("client")}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Client Team Member
                  </Button>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Agilenesia Squad</h3>
                  {agilenesiaTeam.map((member, index) => (
                    <div key={index} className="flex items-end gap-2 mb-4 border p-3 rounded-md">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-grow">
                        <div>
                          <Label htmlFor={`agilenesia-name-${index}`}>Name</Label>
                          <Input
                            id={`agilenesia-name-${index}`}
                            value={member.name}
                            onChange={(e) => handleTeamMemberChange("agilenesia", index, "name", e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor={`agilenesia-role-${index}`}>Role</Label>
                          <Input
                            id={`agilenesia-role-${index}`}
                            value={member.role}
                            onChange={(e) => handleTeamMemberChange("agilenesia", index, "role", e.target.value)}
                            required
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <Label htmlFor={`agilenesia-avatar-${index}`}>Avatar</Label>
                          <ThumbnailGallery
                            value={member.avatarUrl}
                            onChange={(file, previewUrl) => {
                              handleTeamMemberChange("agilenesia", index, "avatarFile", file)
                              handleTeamMemberChange("agilenesia", index, "avatarUrl", previewUrl)
                            }}
                            emptyStateAspectRatioClass="aspect-square"
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => handleRemoveTeamMember("agilenesia", index)}
                        className="shrink-0"
                      >
                        <XIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={() => handleAddTeamMember("agilenesia")}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Agilenesia Team Member
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </FadeInUp>
      </main>
    </div>
  )
}
