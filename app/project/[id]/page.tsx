"use client"

import { notFound } from "next/navigation"
import Link from "next/link"
import { useEffect, useState } from "react"
import { getProjectById } from "@/lib/data"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarIcon, TagIcon, UsersIcon, CheckCircleIcon, ImageIcon } from "lucide-react"
import { ThemeToggleButton } from "@/components/theme-toggle-button"
import { AgilenesiaLogo } from "@/components/agilenesia-logo"
import { ProjectDetailSkeleton } from "@/components/loading-skeletons"
import { FadeInUp, StaggerContainer, StaggerItem } from "@/components/page-transition"
import { motion } from "framer-motion"
import { logout, getUserSession } from "@/app/actions"
import type { User } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { ThumbnailGallery, type GalleryImage } from "@/components/thumbnail-gallery"

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const project = getProjectById(params.id)

  useEffect(() => {
    window.scrollTo(0, 0)
    const fetchUser = async () => {
      const session = await getUserSession()
      setUser(session)
    }
    fetchUser()
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  if (!project) {
    notFound()
  }

  // Prepare gallery images
  const galleryImages: GalleryImage[] = project.galleryImages || [
    // If no gallery images, use the main coaching image
    {
      url: project.coachingImageUrl,
      alt: project.title,
      caption: "Project overview image",
    },
  ]

  if (isLoading) {
    return (
      <div className="bg-background text-foreground min-h-screen">
        <header className="sticky top-0 z-50 bg-card/80 dark:bg-card/80 backdrop-blur-sm border-b">
          <div className="container mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
            <AgilenesiaLogo />
            <ThemeToggleButton />
          </div>
        </header>
        <ProjectDetailSkeleton />
      </div>
    )
  }

  return (
    <div className="bg-background text-foreground min-h-screen">
      <header className="sticky top-0 z-50 bg-card/80 dark:bg-card/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
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
                <Link href="/admin/portfolio" className="text-sm font-medium text-primary">
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
      <main className="container mx-auto p-4 md:p-8 lg:p-12">
        {/* Project Header */}
        <FadeInUp>
          <div className="mb-12 md:mb-16 text-center md:text-left">
            <p className="text-overline text-primary mb-3">Project Details</p>
            <h1 className="text-title sm:text-hero font-bold tracking-tight font-heading text-high-contrast mb-4 leading-tight">
              {project.title}
            </h1>
            <p className="text-subtitle text-primary font-medium">{project.clientName}</p>
          </div>
        </FadeInUp>

        {/* Main Content Grid */}
        <div className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-12">
            {/* Project Gallery */}
            <FadeInUp delay={0.2}>
              <motion.div
                whileHover={{
                  scale: 1.01,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
              >
                <Card className="overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
                  <CardHeader className="pb-2">
                    <CardTitle className="font-heading text-xl text-high-contrast flex items-center gap-2">
                      <ImageIcon className="h-5 w-5 text-primary" />
                      Project Gallery
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ThumbnailGallery images={galleryImages} />
                  </CardContent>
                </Card>
              </motion.div>
            </FadeInUp>

            {/* Project Overview */}
            <FadeInUp delay={0.4}>
              <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
                <Card className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="pb-6">
                    <CardTitle className="font-heading text-2xl text-high-contrast">Project Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Render HTML content from Rich Text Editor */}
                    <div
                      className="text-body text-high-contrast leading-relaxed rich-text-content"
                      dangerouslySetInnerHTML={{ __html: project.description }}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            </FadeInUp>
          </div>

          {/* Sidebar with Details */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-8">
              <FadeInUp delay={0.6}>
                <motion.div
                  whileHover={{ y: -2, scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardHeader className="pb-6">
                      <CardTitle className="font-heading text-lg flex items-center gap-2 text-high-contrast">
                        <CheckCircleIcon className="h-5 w-5 text-primary" />
                        Key Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <h4 className="text-caption font-semibold text-low-contrast uppercase tracking-wider">
                          Category
                        </h4>
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.1 }}
                          whileHover={{ scale: 1.05 }}
                        >
                          <Badge
                            variant="outline"
                            className="border-primary/50 text-primary hover:bg-primary/10 text-xs"
                          >
                            {project.category}
                          </Badge>
                        </motion.div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CalendarIcon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <div className="space-y-1">
                          <h4 className="text-caption font-semibold text-low-contrast uppercase tracking-wider">
                            Duration
                          </h4>
                          <span className="text-body text-high-contrast">{project.duration}</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-caption font-semibold text-low-contrast uppercase tracking-wider flex items-center gap-2">
                          <TagIcon className="h-4 w-4 text-primary" />
                          Related Products/Services
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {project.products.map((product, index) => (
                            <motion.div
                              key={product}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.1 }}
                              whileHover={{ scale: 1.05 }}
                            >
                              <Badge
                                variant="outline"
                                className="border-primary/50 text-primary hover:bg-primary/10 text-xs"
                              >
                                {product}
                              </Badge>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </FadeInUp>

              <FadeInUp delay={0.8}>
                <motion.div
                  whileHover={{ y: -2, scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardHeader className="pb-6">
                      <CardTitle className="font-heading text-lg flex items-center gap-2 text-high-contrast">
                        <UsersIcon className="h-5 w-5 text-primary" />
                        Agilenesia Coach
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <StaggerContainer>
                        {project.squad.map((member, index) => (
                          <StaggerItem key={member.name}>
                            <motion.div
                              className="flex items-center gap-3 p-3 rounded-md hover:bg-muted/50 transition-colors cursor-pointer"
                              whileHover={{ x: 5, scale: 1.02 }}
                              transition={{ type: "spring", stiffness: 400, damping: 17 }}
                            >
                              <Avatar className="h-10 w-10">
                                {member.avatarUrl && member.avatarUrl !== "/placeholder.svg?height=40&width=40" ? (
                                  <AvatarImage src={member.avatarUrl || "/placeholder.svg"} alt={member.name} />
                                ) : (
                                  <AvatarFallback className="text-caption font-medium">
                                    {member.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                              <div className="space-y-1">
                                <p className="text-caption font-semibold text-high-contrast mb-0">{member.name}</p>
                                <p className="text-xs text-low-contrast">{member.role}</p>
                              </div>
                            </motion.div>
                          </StaggerItem>
                        ))}
                      </StaggerContainer>
                    </CardContent>
                  </Card>
                </motion.div>
              </FadeInUp>

              <FadeInUp delay={0.9}>
                {" "}
                {/* Increased delay for the new section */}
                <motion.div
                  whileHover={{ y: -2, scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardHeader className="pb-6">
                      <CardTitle className="font-heading text-lg flex items-center gap-2 text-high-contrast">
                        <UsersIcon className="h-5 w-5 text-primary" />
                        Agilenesia Squad
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <StaggerContainer>
                        {project.agilenesiaSquad?.map(
                          (
                            member,
                            index, // Use project.agilenesiaSquad
                          ) => (
                            <StaggerItem key={member.name}>
                              <motion.div
                                className="flex items-center gap-3 p-3 rounded-md hover:bg-muted/50 transition-colors cursor-pointer"
                                whileHover={{ x: 5, scale: 1.02 }}
                                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                              >
                                <Avatar className="h-10 w-10">
                                  {member.avatarUrl && member.avatarUrl !== "/placeholder.svg?height=40&width=40" ? (
                                    <AvatarImage src={member.avatarUrl || "/placeholder.svg"} alt={member.name} />
                                  ) : (
                                    <AvatarFallback className="text-caption font-medium">
                                      {member.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </AvatarFallback>
                                  )}
                                </Avatar>
                                <div className="space-y-1">
                                  <p className="text-caption font-semibold text-high-contrast mb-0">{member.name}</p>
                                  <p className="text-xs text-low-contrast">{member.role}</p>
                                </div>
                              </motion.div>
                            </StaggerItem>
                          ),
                        )}
                      </StaggerContainer>
                    </CardContent>
                  </Card>
                </motion.div>
              </FadeInUp>
            </div>
          </div>
        </div>
      </main>
      <footer className="py-12 border-t bg-card mt-16">
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
