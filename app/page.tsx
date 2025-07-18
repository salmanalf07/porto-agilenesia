"use client"
import Image from "next/image"
import { projects } from "@/lib/data"
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
import type { User } from "@/lib/data"

export default function LandingPage() {
  const featuredProject = projects[0]
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      const session = await getUserSession()
      console.log(session)
      setUser(session)
    }
    fetchUser()
  }, [])

  const categories = useMemo(() => {
    const allCategories = projects.map((p) => p.category)
    return ["all", ...Array.from(new Set(allCategories))]
  }, [])

  const filteredProjects = useMemo(() => {
    if (selectedCategory === "all") {
      return projects
    }
    return projects.filter((p) => p.category === selectedCategory)
  }, [selectedCategory])

  const handleCategoryChange = (value: string) => {
    setIsLoading(true)
    setSelectedCategory(value)
    setTimeout(() => setIsLoading(false), 300)
  }

  const handleProjectClick = (projectId: string) => {
    router.push(`/project/${projectId}`)
  }

  // Function to strip HTML tags that works on both server and client
  const stripHtmlTags = (html: string) => {
    // Simple regex-based approach that works on both server and client
    return html.replace(/<[^>]*>/g, "")
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
                className="border-primary text-primary hover:bg-primary/10"
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
                    Discover how Agilenesia empowers clients like {featuredProject.clientName} to achieve transformative
                    results through expert agile coaching and strategic guidance.
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
                      Explore Coaching Portfolio
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
                  <h2 className="text-title font-heading text-high-contrast">Our Coaching Portfolio</h2>
                  <p className="text-body text-medium-contrast mt-3 max-w-lg">
                    Explore our successful coaching engagements and transformative results
                  </p>
                </div>
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
                  {filteredProjects.map((project, index) => (
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
                              {stripHtmlTags(project.description)}
                            </p>
                            <div className="flex justify-between items-center pt-2">
                              <div className="space-y-1">
                                <p className="text-caption font-medium text-high-contrast">
                                  Client: {project.clientName}
                                </p>
                                <p className="text-xs text-low-contrast">Team: {project.squad.length} members</p>
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
                  ))}
                </div>
              </StaggerContainer>
            ) : (
              <FadeInUp>
                <div className="text-center py-16">
                  <p className="text-body text-medium-contrast">No projects found for this category.</p>
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
