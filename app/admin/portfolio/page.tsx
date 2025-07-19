"use client"

import { useState, useEffect, useMemo } from "react"
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
  FolderIcon,
  SearchIcon,
  FilterIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
} from "lucide-react"
import { ThemeToggleButton } from "@/components/theme-toggle-button"
import { AgilenesiaLogo } from "@/components/agilenesia-logo"
import { FadeInUp } from "@/components/page-transition"
import { projects as initialProjects, clients, type Project } from "@/lib/data" // Import clients
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
import { useRouter } from "next/navigation"
import type { User } from "@/lib/data"

// Extended Project type with status and lastUpdated
interface PortfolioProject extends Project {
  status: "published" | "draft" | "archived"
  lastUpdated: string
}

export default function PortfolioPage() {
  // Convert initial projects to include status and lastUpdated
  const initialPortfolioProjects: PortfolioProject[] = initialProjects.map((project) => ({
    ...project,
    status: "published", // Default status
    lastUpdated: new Date().toISOString(), // Default lastUpdated
  }))

  const [projects, setProjects] = useState<PortfolioProject[]>(initialPortfolioProjects)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const router = useRouter()

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft" | "archived">("all")
  const [clientFilter, setClientFilter] = useState<string>("all") // Changed from categoryFilter

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  useEffect(() => {
    const fetchUser = async () => {
      const session = await getUserSession()
      setCurrentUser(session)

      // Redirect if not admin
      if (session?.role !== "admin") {
        router.push("/")
      }
    }
    fetchUser()
  }, [router])

  // Get unique clients for filter
  const filterableClients = useMemo(() => {
    return ["all", ...clients.map((c) => c.id)] // Use client IDs for filter values
  }, [])

  // Filter and paginate projects
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      // Apply search filter
      const matchesSearch =
        searchQuery === "" ||
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.category.toLowerCase().includes(searchQuery.toLowerCase())

      // Apply status filter
      const matchesStatus = statusFilter === "all" || project.status === statusFilter

      // Apply client filter (using clientName for display, but clientId for filtering)
      const matchesClient = clientFilter === "all" || project.clientId === clientFilter

      return matchesSearch && matchesStatus && matchesClient
    })
  }, [projects, searchQuery, statusFilter, clientFilter]) // Changed categoryFilter to clientFilter

  // Calculate pagination
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage)
  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredProjects.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredProjects, currentPage, itemsPerPage])

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter, clientFilter]) // Changed categoryFilter to clientFilter

  const handleDelete = (projectId: string) => {
    setProjects(projects.filter((project) => project.id !== projectId))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-600 text-white"
      case "draft":
        return "bg-yellow-500 text-white"
      case "archived":
        return "bg-gray-500 text-white"
      default:
        return ""
    }
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-title font-heading text-high-contrast mb-2">Portfolio Management</h1>
                <p className="text-body text-medium-contrast">Manage coaching portfolio projects and case studies</p>
              </div>
              <Link href="/admin/portfolio/add">
                <Button className="bg-primary hover:bg-agile-teal-dark text-primary-foreground">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Portfolio
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
                  <FolderIcon className="h-5 w-5 text-primary" />
                  Portfolio Projects ({filteredProjects.length})
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
                    <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                      <SelectTrigger className="w-[130px]">
                        <div className="flex items-center gap-2">
                          <FilterIcon className="h-4 w-4" />
                          <span>Status</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={clientFilter} onValueChange={(value) => setClientFilter(value)}>
                      <SelectTrigger className="w-[150px]">
                        <div className="flex items-center gap-2">
                          <FilterIcon className="h-4 w-4" />
                          <span>Client</span> {/* Changed label to Client */}
                        </div>
                      </SelectTrigger>
                      <SelectContent className="max-h-60 overflow-y-auto">
                        {" "}
                        {/* Added classes here */}
                        <SelectItem value="all">All Clients</SelectItem> {/* Changed label to All Clients */}
                        {clients.map((client) => (
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
                      <TableHead>Status</TableHead>
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
                            <Badge variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
                              {project.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="default" className={getStatusBadgeVariant(project.status)}>
                              {project.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(project.lastUpdated)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Button size="sm" variant="outline" asChild>
                                <Link href={`/project/${project.id}`}>
                                  <EyeIcon className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button size="sm" variant="outline" asChild>
                                <Link href={`/admin/portfolio/edit/${project.id}`}>
                                  <EditIcon className="h-4 w-4" />
                                </Link>
                              </Button>
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
                                      This action cannot be undone. This will permanently delete the portfolio project{" "}
                                      <span className="font-semibold">{project.title}</span> and remove it from our
                                      servers.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(project.id)}>
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
                          No portfolio projects found matching your filters
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
