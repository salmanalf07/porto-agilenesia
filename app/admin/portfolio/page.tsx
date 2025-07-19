"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  PlusIcon,
  EditIcon,
  TrashIcon,
  FolderOpenIcon,
  SearchIcon,
  FilterIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import { ThemeToggleButton } from "@/components/theme-toggle-button"
import { AgilenesiaLogo } from "@/components/agilenesia-logo"
import { FadeInUp } from "@/components/page-transition"
import type { Project } from "@/lib/data"
import { getUserSession, logout } from "@/app/actions"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { getProjects, deleteProject } from "@/lib/portfolio-crud" // Import new CRUD functions
import { getClients } from "@/lib/client-crud" // Import getClients

export default function PortfolioPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [clients, setClients] = useState<any[]>([]) // State for clients
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [clientFilter, setClientFilter] = useState("all")

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  useEffect(() => {
    const fetchUser = async () => {
      const session = await getUserSession()
      setCurrentUser(session)
    }
    fetchUser()
  }, [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    const fetchedProjects = await getProjects()
    const fetchedClients = await getClients()

    if (fetchedProjects) {
      setProjects(fetchedProjects)
    } else {
      setError("Failed to load projects.")
    }

    if (fetchedClients) {
      setClients(fetchedClients)
    } else {
      setError((prev) => (prev ? prev + " And failed to load clients." : "Failed to load clients."))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Filter and paginate projects
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      // Apply search filter
      const matchesSearch =
        searchQuery === "" ||
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.category.toLowerCase().includes(searchQuery.toLowerCase())

      // Apply category filter
      const matchesCategory = categoryFilter === "all" || project.category === categoryFilter

      // Apply client filter
      const matchesClient = clientFilter === "all" || project.clientId === clientFilter

      return matchesSearch && matchesCategory && matchesClient
    })
  }, [projects, searchQuery, categoryFilter, clientFilter])

  // Calculate pagination
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage)
  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredProjects.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredProjects, currentPage, itemsPerPage])

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, categoryFilter, clientFilter])

  const handleDeleteProject = async (projectId: string) => {
    const success = await deleteProject(projectId)
    if (success) {
      fetchData() // Re-fetch projects after deletion
    } else {
      alert("Failed to delete project. Please check console for details.")
    }
  }

  const uniqueCategories = useMemo(() => {
    const categories = new Set(projects.map((project) => project.category))
    return ["all", ...Array.from(categories).sort()]
  }, [projects])

  const uniqueClients = useMemo(() => {
    return [{ id: "all", name: "All Clients" }, ...clients.map((c) => ({ id: c.id, name: c.name }))]
  }, [clients])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading projects...</p>
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-title font-heading text-high-contrast mb-2">Portfolio Management</h1>
                <p className="text-body text-medium-contrast">
                  Manage your project portfolio, including details, images, and team members.
                </p>
              </div>
              <Link href="/admin/portfolio/add">
                <Button className="bg-primary hover:bg-agile-teal-dark text-primary-foreground">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Portfolio Item
                </Button>
              </Link>
            </div>
          </div>
        </FadeInUp>

        <FadeInUp delay={0.2}>
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row gap-4 justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FolderOpenIcon className="h-5 w-5 text-primary" />
                  Portfolio ({filteredProjects.length})
                </CardTitle>

                {/* Search and Filter Controls */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search projects..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-full sm:w-64"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Select value={categoryFilter} onValueChange={(value: any) => setCategoryFilter(value)}>
                      <SelectTrigger className="w-[130px]">
                        <div className="flex items-center gap-2">
                          <FilterIcon className="h-4 w-4" />
                          <span>Category</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {uniqueCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category === "all" ? "All Categories" : category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={clientFilter} onValueChange={(value: any) => setClientFilter(value)}>
                      <SelectTrigger className="w-[130px]">
                        <div className="flex items-center gap-2">
                          <FilterIcon className="h-4 w-4" />
                          <span>Client</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {uniqueClients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedProjects.length > 0 ? (
                      paginatedProjects.map((project) => (
                        <TableRow key={project.id}>
                          <TableCell className="font-medium">{project.title}</TableCell>
                          <TableCell>{project.clientName}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{project.category}</Badge>
                          </TableCell>
                          <TableCell>{project.duration}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {project.updated_at ? formatDate(project.updated_at) : "N/A"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Link href={`/admin/portfolio/edit/${project.id}`}>
                                <Button size="sm" variant="outline">
                                  <EditIcon className="h-4 w-4" />
                                </Button>
                              </Link>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="destructive">
                                    <TrashIcon className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete the project{" "}
                                      <span className="font-semibold">{project.title}</span> and all associated data and
                                      images from our servers.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteProject(project.id)}>
                                      Continue
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                          No portfolio items found matching your filters
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Controls */}
              {filteredProjects.length > 0 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-muted-foreground">
                    Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredProjects.length)} to{" "}
                    {Math.min(currentPage * itemsPerPage, filteredProjects.length)} of {filteredProjects.length}{" "}
                    projects
                  </div>

                  <div className="flex items-center gap-2">
                    <Select
                      value={String(itemsPerPage)}
                      onValueChange={(value) => {
                        setItemsPerPage(Number(value))
                        setCurrentPage(1)
                      }}
                    >
                      <SelectTrigger className="w-[80px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeftIcon className="h-4 w-4" />
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                          // Show first page, last page, current page, and pages around current
                          let pageToShow: number | null = null

                          if (totalPages <= 5) {
                            // If 5 or fewer pages, show all
                            pageToShow = i + 1
                          } else if (currentPage <= 3) {
                            // Near start
                            if (i < 4) {
                              pageToShow = i + 1
                            } else {
                              pageToShow = totalPages
                            }
                          } else if (currentPage >= totalPages - 2) {
                            // Near end
                            if (i === 0) {
                              pageToShow = 1
                            } else {
                              pageToShow = totalPages - 4 + i
                            }
                          } else {
                            // Middle
                            if (i === 0) {
                              pageToShow = 1
                            } else if (i === 4) {
                              pageToShow = totalPages
                            } else {
                              pageToShow = currentPage - 1 + i
                            }
                          }

                          // Add ellipsis
                          if (
                            (pageToShow === totalPages && currentPage < totalPages - 2 && totalPages > 5) ||
                            (pageToShow === 1 && currentPage > 3 && totalPages > 5)
                          ) {
                            return (
                              <Button key={`ellipsis-${i}`} variant="ghost" size="sm" className="w-8 h-8 p-0" disabled>
                                ...
                              </Button>
                            )
                          }

                          return (
                            <Button
                              key={pageToShow}
                              variant={currentPage === pageToShow ? "default" : "outline"}
                              size="sm"
                              className="w-8 h-8 p-0"
                              onClick={() => setCurrentPage(pageToShow!)}
                            >
                              {pageToShow}
                            </Button>
                          )
                        })}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRightIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </FadeInUp>
      </main>
    </div>
  )
}
