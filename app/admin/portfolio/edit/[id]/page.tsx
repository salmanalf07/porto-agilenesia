"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ThemeToggleButton } from "@/components/theme-toggle-button"
import { AgilenesiaLogo } from "@/components/agilenesia-logo"
import { FadeInUp } from "@/components/page-transition"
import { getUserSession, logout } from "@/app/actions"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { PlusIcon, XIcon, ArrowLeftIcon, SaveIcon, EyeIcon } from "lucide-react"
import type { User } from "@/lib/data"
import { RichTextEditor } from "@/components/rich-text-editor"
import { ProjectGalleryInput, type ProjectImageInput } from "@/components/project-gallery-input"
import { getProjectById, updateProject } from "@/lib/portfolio-crud"
import { supabase } from "@/lib/supabaseClient"

interface TeamMember {
  name: string
  role: string
  avatarUrl: string
}

interface PortfolioProject {
  id: string
  title: string
  clientName: string
  clientId?: string
  clientLogoUrl: string
  coachingImageUrl: string
  galleryImages?: ProjectImageInput[]
  products: string[]
  category: string
  duration: string
  description: string
  squad: TeamMember[]
  agilenesiaSquad?: TeamMember[] 
  status: "published" | "draft" | "archived"
  lastUpdated: string
}

export default function EditPortfolioPage({ params }: { params: { id: string } }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
   const [clients, setClients] = useState<{ id: string; name: string; logoUrl?: string }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [project, setProject] = useState<PortfolioProject | null>(null)
  const router = useRouter()

  const [formData, setFormData] = useState({
    title: "",
    clientId: "",
    category: "",
    duration: "",
    description: "",
    status: "published" as "published" | "draft" | "archived",
    products: [""] as string[],
  })

  const [coachingSquadMembers, setCoachingSquadMembers] = useState<TeamMember[]>([
    { name: "", role: "", avatarUrl: "" },
  ])
  const [agilenesiaSquadMembers, setAgilenesiaSquadMembers] = useState<TeamMember[]>([
    { name: "", role: "", avatarUrl: "" },
  ])

  // Change from single coaching image to gallery images
  const [galleryImages, setGalleryImages] = useState<ProjectImageInput[]>([{ url: "", alt: "" }])

   useEffect(() => {
    const fetchData = async () => {
      const session = await getUserSession()
      setCurrentUser(session)

      if (session?.role !== "admin") {
        router.push("/")
        return
      }

      // Fetch clients
      const { data: clientsData, error: clientsError } = await supabase.from("clients").select("id, name, logoUrl")

      if (clientsError) {
        console.error("Failed to fetch clients:", clientsError.message)
      } else {
        setClients(clientsData ?? [])
      }

      // Fetch project data
      const projectData = await getProjectById(params.id)

      if (!projectData) {
        router.push("/admin/portfolio")
        return
      }

      // Parse JSON fields safely
      let parsedProducts: string[] = []
      let parsedGalleryImages: ProjectImageInput[] = []
      let parsedSquad: TeamMember[] = []
      let parsedAgilenesiaSquad: TeamMember[] = []

      try {
        parsedProducts =
          typeof projectData.products === "string"
            ? JSON.parse(projectData.products)
            : Array.isArray(projectData.products)
              ? projectData.products
              : []
      } catch (e) {
        console.error("Failed to parse products:", e)
        parsedProducts = []
      }

      try {
        parsedGalleryImages =
          typeof projectData.galleryImages === "string"
            ? JSON.parse(projectData.galleryImages)
            : Array.isArray(projectData.galleryImages)
              ? projectData.galleryImages
              : []
      } catch (e) {
        console.error("Failed to parse galleryImages:", e)
        parsedGalleryImages = []
      }

      try {
        parsedSquad =
          typeof projectData.squad === "string"
            ? JSON.parse(projectData.squad)
            : Array.isArray(projectData.squad)
              ? projectData.squad
              : []
      } catch (e) {
        console.error("Failed to parse squad:", e)
        parsedSquad = []
      }

      try {
        parsedAgilenesiaSquad =
          typeof projectData.agilenesiaSquad === "string"
            ? JSON.parse(projectData.agilenesiaSquad)
            : Array.isArray(projectData.agilenesiaSquad)
              ? projectData.agilenesiaSquad
              : []
      } catch (e) {
        console.error("Failed to parse agilenesiaSquad:", e)
        parsedAgilenesiaSquad = []
      }

      const portfolioProject: PortfolioProject = {
        ...projectData,
        clientId: projectData.clientId || "",
        status: projectData.status ?? "published",
        lastUpdated: new Date().toISOString(),
        products: parsedProducts,
        galleryImages: parsedGalleryImages,
        squad: parsedSquad,
        agilenesiaSquad: parsedAgilenesiaSquad,
      }

      setProject(portfolioProject)

      setFormData({
        title: portfolioProject.title,
        clientId: portfolioProject.clientId || "",
        category: portfolioProject.category,
        duration: portfolioProject.duration,
        description: portfolioProject.description || "",
        status: portfolioProject.status,
        products: parsedProducts.length > 0 ? parsedProducts : [""],
      })

      setGalleryImages(parsedGalleryImages.length > 0 ? parsedGalleryImages : [{ url: "", alt: "" }])

      setCoachingSquadMembers(parsedSquad.length > 0 ? parsedSquad : [{ name: "", role: "", avatarUrl: "" }])

      setAgilenesiaSquadMembers(
        parsedAgilenesiaSquad.length > 0 ? parsedAgilenesiaSquad : [{ name: "", role: "", avatarUrl: "" }],
      )

      setIsLoading(false)
    }

    fetchData()
  }, [params.id, router])



  const handleAddProduct = () => {
    setFormData({
      ...formData,
      products: [...formData.products, ""],
    })
  }

  const handleRemoveProduct = (index: number) => {
    const updatedProducts = [...formData.products]
    updatedProducts.splice(index, 1)
    setFormData({
      ...formData,
      products: updatedProducts,
    })
  }

  const handleProductChange = (index: number, value: string) => {
    const updatedProducts = [...formData.products]
    updatedProducts[index] = value
    setFormData({
      ...formData,
      products: updatedProducts,
    })
  }

  const handleAddTeamMember = (squadType: "coaching" | "agilenesia") => {
    if (squadType === "coaching") {
      setCoachingSquadMembers([...coachingSquadMembers, { name: "", role: "", avatarUrl: "" }])
    } else {
      setAgilenesiaSquadMembers([...agilenesiaSquadMembers, { name: "", role: "", avatarUrl: "" }])
    }
  }

  const handleRemoveTeamMember = (squadType: "coaching" | "agilenesia", index: number) => {
    if (squadType === "coaching") {
      const updatedMembers = [...coachingSquadMembers]
      updatedMembers.splice(index, 1)
      setCoachingSquadMembers(updatedMembers)
    } else {
      const updatedMembers = [...agilenesiaSquadMembers]
      updatedMembers.splice(index, 1)
      setAgilenesiaSquadMembers(updatedMembers)
    }
  }

  const handleTeamMemberChange = (
    squadType: "coaching" | "agilenesia",
    index: number,
    field: keyof TeamMember,
    value: string,
  ) => {
    if (squadType === "coaching") {
      const updatedMembers = [...coachingSquadMembers]
      updatedMembers[index] = { ...updatedMembers[index], [field]: value }
      setCoachingSquadMembers(updatedMembers)
    } else {
      const updatedMembers = [...agilenesiaSquadMembers]
      updatedMembers[index] = { ...updatedMembers[index], [field]: value }
      setAgilenesiaSquadMembers(updatedMembers)
    }
  }

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Find selected client
    const selectedClient = clients.find((c) => c.id === formData.clientId)

    const updatedProject = {
      title: formData.title,
      clientId: formData.clientId,
      clientName: selectedClient?.name || "",
      clientLogoUrl: selectedClient?.logoUrl || "",
      category: formData.category,
      duration: formData.duration,
      description: formData.description,
      status: formData.status,
      products: formData.products.filter((p) => p.trim() !== ""),
      coachingImageUrl: galleryImages[0]?.url || "",
      galleryImages: galleryImages.filter((img) => img.url.trim() !== ""),
      squad: coachingSquadMembers.filter((member) => member.name.trim() !== ""),
      agilenesiaSquad: agilenesiaSquadMembers.filter((member) => member.name.trim() !== ""),
    }

    try {
      const savedProject = await updateProject(params.id, updatedProject)
      console.log("✅ Project updated:", savedProject)
      router.push("/admin/portfolio")
    } catch (err) {
      console.error("❌ Error saving project:", err)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-background text-foreground min-h-screen flex items-center justify-center">
        <p>Loading...</p>
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
                className="border-primary text-primary hover:bg-primary/10"
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
            <div>
              <h1 className="text-title font-heading text-high-contrast mb-2">Edit Portfolio Project</h1>
              <p className="text-body text-medium-contrast">Update the details of this coaching portfolio project</p>
            </div>
          </div>
        </FadeInUp>

        <FadeInUp delay={0.2}>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Project Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
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
                              <SelectItem value="none">None</SelectItem>
                                {clients.map((client) => (
                                  <SelectItem key={client.id} value={String(client.id)}>
                                    {client.name}
                                  </SelectItem>
                                ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="description">Project Overview</Label>
                        <RichTextEditor
                          value={formData.description}
                          onChange={(content) => setFormData({ ...formData, description: content })}
                          className="min-h-[200px]"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Project Gallery</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProjectGalleryInput value={galleryImages} onChange={setGalleryImages} />
                    <p className="text-sm text-muted-foreground mt-2">
                      Add images for the project gallery. The first image will be used as the main project image.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Products & Services</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {formData.products.map((product, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={product}
                          onChange={(e) => handleProductChange(index, e.target.value)}
                          placeholder="e.g. Agile Coaching"
                          className="flex-1"
                        />
                        {formData.products.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => handleRemoveProduct(index)}
                          >
                            <XIcon className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddProduct}
                      className="flex items-center"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add Product/Service
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Agilenesia Coach</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {coachingSquadMembers.map((member, index) => (
                      <div key={index} className="space-y-4 pb-4 border-b last:border-0">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">Team Coach {index + 1}</h4>
                          {coachingSquadMembers.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveTeamMember("coaching", index)}
                            >
                              <XIcon className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor={`coaching-member-name-${index}`}>Name</Label>
                            <Input
                              id={`coaching-member-name-${index}`}
                              value={member.name}
                              onChange={(e) => handleTeamMemberChange("coaching", index, "name", e.target.value)}
                              placeholder="Full Name"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`coaching-member-role-${index}`}>Role</Label>
                            <Input
                              id={`coaching-member-role-${index}`}
                              value={member.role}
                              onChange={(e) => handleTeamMemberChange("coaching", index, "role", e.target.value)}
                              placeholder="e.g. Lead Agile Coach"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`coaching-member-avatar-${index}`}>Avatar URL (optional)</Label>
                            <Input
                              id={`coaching-member-avatar-${index}`}
                              value={member.avatarUrl}
                              onChange={(e) => handleTeamMemberChange("coaching", index, "avatarUrl", e.target.value)}
                              placeholder="https://example.com/avatar.jpg"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddTeamMember("coaching")}
                      className="flex items-center"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add Team Member
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Agilenesia Squad</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {agilenesiaSquadMembers.map((member, index) => (
                      <div key={index} className="space-y-4 pb-4 border-b last:border-0">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">Team Member {index + 1}</h4>
                          {agilenesiaSquadMembers.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveTeamMember("agilenesia", index)}
                            >
                              <XIcon className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor={`agilenesia-member-name-${index}`}>Name</Label>
                            <Input
                              id={`agilenesia-member-name-${index}`}
                              value={member.name}
                              onChange={(e) => handleTeamMemberChange("agilenesia", index, "name", e.target.value)}
                              placeholder="Full Name"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`agilenesia-member-role-${index}`}>Role</Label>
                            <Input
                              id={`agilenesia-member-role-${index}`}
                              value={member.role}
                              onChange={(e) => handleTeamMemberChange("agilenesia", index, "role", e.target.value)}
                              placeholder="e.g. Founder & CEO"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`agilenesia-member-avatar-${index}`}>Avatar URL (optional)</Label>
                            <Input
                              id={`agilenesia-member-avatar-${index}`}
                              value={member.avatarUrl}
                              onChange={(e) => handleTeamMemberChange("agilenesia", index, "avatarUrl", e.target.value)}
                              placeholder="https://example.com/avatar.jpg"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddTeamMember("agilenesia")}
                      className="flex items-center"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add Team Member
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1 space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Publishing</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: "published" | "draft" | "archived") =>
                          setFormData({ ...formData, status: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-2">
                        Only published projects will be visible to clients.
                      </p>
                    </div>

                    <div className="pt-4 flex flex-col gap-2">
                      <Button type="submit" className="w-full bg-primary hover:bg-agile-teal-dark">
                        <SaveIcon className="h-4 w-4 mr-2" />
                        Update Project
                      </Button>
                      <Button type="button" variant="outline" className="w-full" asChild>
                        <Link href="/admin/portfolio">Cancel</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Project Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium">Project ID</p>
                      <p className="text-sm text-muted-foreground">{project?.id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Last Updated</p>
                      <p className="text-sm text-muted-foreground">
                        {project?.lastUpdated ? new Date(project.lastUpdated).toLocaleString() : "Never"}
                      </p>
                    </div>
                    <div className="pt-2">
                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <Link href={`/project/${project?.id}`} target="_blank">
                          <EyeIcon className="h-4 w-4 mr-2" />
                          View Live Project
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </FadeInUp>
      </main>
    </div>
  )
}
