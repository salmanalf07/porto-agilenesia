"use client"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRightIcon, FilterIcon } from "lucide-react"
import { ThemeToggleButton } from "@/components/theme-toggle-button"
import { useState, useMemo, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AgilenesiaLogo } from "@/components/agilenesia-logo"
import { ProjectCardSkeleton } from "@/components/loading-skeletons"
import { FadeInUp, StaggerContainer, StaggerItem } from "@/components/page-transition"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { logout, getUserSession } from "@/app/actions"
import { supabase } from "@/lib/supabaseClient"
import type { User } from "@/lib/data"

interface ProjectData {
  id: string
  title: string
  clientName: string
  clientId?: string
  clientLogoUrl?: string
  coachingImageUrl?: string
  category: string
  duration: string
  description: string
  status: string
  products: string
  squad: string
  galleryImages?: string
  agilenesiaSquad?: string
  clients?: {
    id: string
    name: string
    logoUrl?: string
  }
}

interface ExtendedUser extends User {
  clientId?: string
}

export default function LandingPage() {
  const [projects, setProjects] = useState<ProjectData[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<ExtendedUser | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Fetch user session
        const session = await getUserSession()

        // If user exists, get their client information
        let extendedUser: ExtendedUser | null = session
        if (session && session.role === "client") {
          // Get user's clientId from users table
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("clientId")
            .eq("id", session.id)
            .single()

          if (!userError && userData) {
            extendedUser = { ...session, clientId: userData.clientId }
          }
        }

        setUser(extendedUser)

        // Fetch projects from database with client relationship
        // Only fetch published projects for non-admin users
        let query = supabase
          .from("projects")
          .select(`
            *,
            clients (
              id,
              name,
              logoUrl
            )
          `)
          .order("lastUpdated", { ascending: false })

        // If user is not admin, only show published projects
        if (!extendedUser || extendedUser.role !== "admin") {
          query = query.eq("status", "published")
        }

        const { data: projectsData, error: projectsError } = await query

        if (projectsError) {
          console.error("Error fetching projects:", projectsError)
          setProjects([])
          return
        }

        console.log("Fetched projects:", projectsData)

        // Filter projects based on user role
        let filteredProjects = projectsData || []

        if (extendedUser?.role === "client" && extendedUser?.clientId) {
          // If user is a client, only show projects where clientId matches
          filteredProjects =
            projectsData?.filter((project: ProjectData) => {
              return project.clientId === extendedUser.clientId
            }) || []
          console.log("Filtered projects for client ID:", extendedUser.clientId, filteredProjects)
        } else if (extendedUser?.role === "admin") {
          // If user is admin, show all projects (published and draft)
          filteredProjects = projectsData || []
          console.log("All projects for admin:", filteredProjects)
        } else {
          // If no user, show only published projects (already filtered in query)
          filteredProjects = projectsData || []
        }

        setProjects(filteredProjects)
      } catch (error) {
        console.error("Error fetching data:", error)
        setProjects([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const categories = useMemo(() => {
    const allCategories = projects.map((p) => p.category).filter(Boolean)
    return ["all", ...Array.from(new Set(allCategories))]
  }, [projects])

  const filteredProjects = useMemo(() => {
    if (selectedCategory === "all") {
      return projects
    }
    return projects.filter((p) => p.category === selectedCategory)
  }, [selectedCategory, projects])

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value)
  }

  const handleProjectClick = (projectId: string) => {
    router.push(`/project/${projectId}`)
  }

  // Function to strip HTML tags that works on both server and client
  const stripHtmlTags = (html: string) => {
    if (!html) return ""
    return html.replace(/<[^>]*>/g, "")
  }

  // Parse JSON strings for display
  const parseSquad = (squadString: string) => {
    try {
      if (!squadString) return []
      return JSON.parse(squadString)
    } catch {
      return []
    }
  }

  const featuredProject = filteredProjects[0] || {
    clientName: user?.role === "client" ? "Your Organization" : "Our Valued Clients",
    title: "Agile Transformation",
  }

  const getClientName = (project: ProjectData) => {
    return project.clients?.name || project.clientName || "Unknown Client"
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 lg:px-6 h-16 flex items-center">
          <AgilenesiaLogo />
          <nav className="ml-auto flex gap-2 sm:gap-4 items-center">
            {user?.role === "admin" && (
              <>
                <Link href="/admin/users" className="text-sm font-medium hover:text-primary transition-colors">
                  Users
                </Link>
                <Link href="/admin/clients" className="text-sm font-medium hover:text-primary transition-colors">
                  Clients
                </Link>
                <Link href="/admin/portfolio" className="text-sm font-medium hover:text-primary transition-colors">
                  Portfolio
                </Link>
              </>
            )}
            <ThemeToggleButton />
            {user && (
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
      <main className="flex-1">
        {/* Hero Section Redesign */}
        <section className="relative py-16 md:py-24 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-background to-secondary/30 animate-gradient bg-200%"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-8">
                <FadeInUp>
                  <h1 className="text-hero sm:text-display font-bold tracking-tighter font-heading text-high-contrast">
                    <span className="text-primary">Tumbuh X</span> Agilenesia Client
                  </h1>
                </FadeInUp>
                <FadeInUp delay={0.2}>
                  <p className="text-body-large text-medium-contrast max-w-2xl">
                    {user?.role === "client"
                      ? `Welcome back! Explore your coaching portfolio and see how Agilenesia is helping ${getClientName(featuredProject)} achieve transformative results.`
                      : `Discover how Agilenesia empowers clients like ${getClientName(featuredProject)} to achieve transformative results through expert agile coaching and strategic guidance.`}
                  </p>
                </FadeInUp>
                <FadeInUp delay={0.4}>
                  <div className="pt-2">
                    <Button
                      size="lg"
                      className="bg-primary hover:bg-agile-teal-dark text-primary-foreground transition-colors duration-300 shadow-lg text-base font-medium px-8 py-3"
                      onClick={() => {
                        const portfolioSection = document.getElementById("portfolio-section")
                        portfolioSection?.scrollIntoView({ behavior: "smooth" })
                      }}
                    >
                      {user?.role === "client" ? "View Your Portfolio" : "Explore Coaching Portfolio"}
                      <ArrowRightIcon className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </FadeInUp>
              </div>
              <FadeInUp delay={0.6}>
                <div className="hidden md:block">
                  <motion.div
                    className="rounded-lg overflow-hidden shadow-2xl"
                    whileHover={{
                      scale: 1.02,
                      rotateY: 5,
                      rotateX: 5,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                    }}
                    style={{
                      transformStyle: "preserve-3d",
                      perspective: 1000,
                    }}
                  >
                    <Image
                      src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&h=450&fit=crop&crop=center"
                      alt="Team collaboration and agile coaching"
                      width={600}
                      height={450}
                      className="object-cover w-full h-full"
                      priority
                    />
                  </motion.div>
                </div>
              </FadeInUp>
            </div>
          </div>
        </section>

        {/* Project List Section */}
        <section id="portfolio-section" className="py-16 md:py-20 lg:py-24 bg-background">
          <div className="container mx-auto px-4">
            <FadeInUp>
              <div className="flex flex-col sm:flex-row justify-between items-center mb-12 md:mb-16">
                <div className="text-center sm:text-left mb-6 sm:mb-0">
                  <p className="text-overline text-primary mb-2">Portfolio</p>
                  <h2 className="text-title font-heading text-high-contrast">
                    {user?.role === "client" ? "Your Coaching Portfolio" : "Our Coaching Portfolio"}
                  </h2>
                  <p className="text-body text-medium-contrast mt-3 max-w-lg">
                    {user?.role === "client"
                      ? "Review your coaching engagements and transformation progress"
                      : "Explore our successful coaching engagements and transformative results"}
                  </p>
                </div>
                {categories.length > 1 && (
                  <div className="flex items-center gap-3">
                    <FilterIcon className="h-5 w-5 text-low-contrast" />
                    <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                      <SelectTrigger className="w-[180px] bg-card text-caption">
                        <SelectValue placeholder="Filter by category" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60 overflow-y-auto">
                        {categories.map((category) => (
                          <SelectItem key={category} value={category} className="text-caption">
                            {category === "all" ? "All Categories" : category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </FadeInUp>

            {isLoading ? (
              <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <ProjectCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredProjects.length > 0 ? (
              <StaggerContainer>
                <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {filteredProjects.map((project, index) => {
                    const squad = parseSquad(project.squad)
                    const clientName = getClientName(project)

                    return (
                      <StaggerItem key={project.id}>
                        <motion.div
                          whileHover={{
                            y: -8,
                            scale: 1.02,
                            rotateX: 5,
                            rotateY: 5,
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                          }}
                          style={{
                            transformStyle: "preserve-3d",
                            perspective: 1000,
                          }}
                        >
                          <Card
                            className={`h-full overflow-hidden transition-all duration-300 ease-out hover:shadow-2xl hover:border-primary/50 group cursor-pointer ${
                              index % 2 === 0 ? "bg-card" : "bg-muted/30 dark:bg-card/50"
                            }`}
                            onClick={() => handleProjectClick(project.id)}
                          >
                            <div className="relative overflow-hidden">
                              <Image
                                src={project.coachingImageUrl || "/placeholder.svg"}
                                alt={project.title}
                                width={400}
                                height={200}
                                className="object-cover w-full h-48 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              {user?.role === "admin" && project.status !== "published" && (
                                <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium">
                                  Draft
                                </div>
                              )}
                            </div>
                            <CardHeader className="p-6">
                              <div className="space-y-2">
                                <p className="text-overline text-secondary">{project.category}</p>
                                <CardTitle className="text-xl font-heading text-high-contrast group-hover:text-primary transition-colors duration-300 leading-snug">
                                  {project.title}
                                </CardTitle>
                              </div>
                            </CardHeader>
                            <CardContent className="p-6 pt-0 space-y-4">
                              <p className="text-body text-medium-contrast leading-relaxed line-clamp-3">
                                {stripHtmlTags(project.description || "")}
                              </p>
                              <div className="flex justify-between items-center pt-2">
                                <div className="space-y-1">
                                  <p className="text-caption font-medium text-high-contrast">Client: {clientName}</p>
                                  <p className="text-xs text-low-contrast">Team: {squad.length} members</p>
                                </div>
                                <Button
                                  size="sm"
                                  className="bg-primary hover:bg-agile-teal-dark shadow-md transition-colors duration-300 text-caption font-medium px-3 py-2 force-white-text"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleProjectClick(project.id)
                                  }}
                                >
                                  View Details
                                  <ArrowRightIcon className="ml-1 h-4 w-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      </StaggerItem>
                    )
                  })}
                </div>
              </StaggerContainer>
            ) : (
              <FadeInUp>
                <div className="text-center py-16">
                  <p className="text-body text-medium-contrast">
                    {user?.role === "client"
                      ? "No projects found for your organization. Please contact your administrator."
                      : selectedCategory === "all"
                        ? "No projects found."
                        : "No projects found for this category."}
                  </p>
                </div>
              </FadeInUp>
            )}
          </div>
        </section>
      </main>
      <footer className="py-12 border-t bg-card">
        <div className="container mx-auto px-4 text-center">
          <p className="text-caption text-low-contrast">
            &copy; {new Date().getFullYear()} Agilenesia. All rights reserved.
          </p>
          <p className="text-caption text-low-contrast mt-1">Empowering growth through agile excellence.</p>
        </div>
      </footer>
    </div>
  )
}
