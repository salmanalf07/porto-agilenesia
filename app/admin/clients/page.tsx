"use client"

import { useCallback } from "react"
import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  PlusIcon,
  EditIcon,
  TrashIcon,
  BuildingIcon,
  SearchIcon,
  FilterIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import { ThemeToggleButton } from "@/components/theme-toggle-button"
import { AgilenesiaLogo } from "@/components/agilenesia-logo"
import { FadeInUp } from "@/components/page-transition"
import type { Client } from "@/lib/data"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { User } from "next-auth"
import { LogoFileUploader } from "@/components/logo-file-uploader"
import { supabase } from "@/lib/supabaseClient"

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    logoUrl: "",
    status: "active" as "active" | "inactive",
  })

  const [currentLogoFile, setCurrentLogoFile] = useState<File | null>(null)
  const [currentLogoPreviewUrl, setCurrentLogoPreviewUrl] = useState<string | null>(null)

  // Fetch user session on component mount
  useEffect(() => {
    const fetchUser = async () => {
      const session = await getUserSession()
      setCurrentUser(session)
    }
    fetchUser()
  }, [])

  // Fetch clients from Supabase
  const fetchClients = useCallback(async () => {
    const { data, error } = await supabase.from("clients").select("*").order("lastUpdated", { ascending: false })
    if (error) {
      console.error("Error fetching clients:", error)
      // Optionally, show a toast notification here
    } else {
      setClients(data as Client[])
    }
  }, [])

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  // Filter and paginate clients
  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const matchesSearch =
        searchQuery === "" ||
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.industry.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === "all" || client.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [clients, searchQuery, statusFilter])

  // Calculate pagination
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage)
  const paginatedClients = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredClients.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredClients, currentPage, itemsPerPage])

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter])

  const resetForm = () => {
    setFormData({
      name: "",
      industry: "",
      logoUrl: "",
      status: "active",
    })
    setCurrentLogoFile(null)
    setCurrentLogoPreviewUrl(null)
    setEditingClient(null)
  }

  const handleEdit = (client: Client) => {
    setEditingClient(client)
    setFormData({
      name: client.name,
      industry: client.industry,
      logoUrl: client.logoUrl || "",
      status: client.status,
    })
    setCurrentLogoFile(null)
    setCurrentLogoPreviewUrl(client.logoUrl || null)
    setIsDialogOpen(true)
  }

  const handleLogoChange = useCallback((file: File | null, previewUrl: string | null) => {
    setCurrentLogoFile(file)
    setCurrentLogoPreviewUrl(previewUrl)
    setFormData((prev) => ({ ...prev, logoUrl: previewUrl || "" }))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    let finalLogoUrl = currentLogoPreviewUrl || ""

    // If a new file is selected, upload it to Supabase Storage
    if (currentLogoFile) {
      const fileExtension = currentLogoFile.name.split(".").pop()
      const fileName = `${formData.name.toLowerCase().replace(/\s/g, "-")}-${Date.now()}.${fileExtension}`
      const { data, error } = await supabase.storage.from("client-logos").upload(fileName, currentLogoFile, {
        cacheControl: "3600",
        upsert: false,
      })

      if (error) {
        console.error("Error uploading logo:", error)
        // Optionally, show a toast notification
        return
      }
      // Get public URL of the uploaded file
      const { data: publicUrlData } = supabase.storage.from("client-logos").getPublicUrl(data.path)
      finalLogoUrl = publicUrlData.publicUrl
    }

    if (editingClient) {
      // Update existing client in Supabase
      const { error } = await supabase
        .from("clients")
        .update({
          name: formData.name,
          industry: formData.industry,
          logoUrl: finalLogoUrl,
          status: formData.status,
          lastUpdated: new Date().toISOString(),
        })
        .eq("id", editingClient.id)

      if (error) {
        console.error("Error updating client:", error)
        // Optionally, show a toast notification
      } else {
        fetchClients() // Re-fetch clients to update the list
      }
    } else {
      // Add new client to Supabase
      const { error } = await supabase.from("clients").insert({
        name: formData.name,
        industry: formData.industry,
        logoUrl: finalLogoUrl,
        status: formData.status,
        lastUpdated: new Date().toISOString(),
      })

      if (error) {
        console.error("Error adding client:", error)
        // Optionally, show a toast notification
      } else {
        fetchClients() // Re-fetch clients to update the list
      }
    }

    setIsDialogOpen(false)
    resetForm()
  }

  const handleDelete = async (clientId: string) => {
    // First, get the client to potentially delete its logo from storage
    const clientToDelete = clients.find((client) => client.id === clientId)
    if (clientToDelete?.logoUrl) {
      try {
        // Extract the file path from the public URL
        const urlParts = clientToDelete.logoUrl.split("/")
        const filePath = urlParts.slice(urlParts.indexOf("client-logos") + 1).join("/")

        const { error: storageError } = await supabase.storage.from("client-logos").remove([filePath])
        if (storageError) {
          console.error("Error deleting logo from storage:", storageError)
          // Continue with client deletion even if logo deletion fails
        }
      } catch (e) {
        console.error("Failed to parse logo URL or delete from storage:", e)
      }
    }

    // Delete client from Supabase
    const { error } = await supabase.from("clients").delete().eq("id", clientId)

    if (error) {
      console.error("Error deleting client:", error)
      // Optionally, show a toast notification
    } else {
      fetchClients() // Re-fetch clients to update the list
    }
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
                <Link href="/admin/clients" className="text-sm font-medium text-primary">
                  Clients
                </Link>
                <Link href="/admin/portfolio" className="text-sm font-medium hover:text-primary transition-colors">
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
                <h1 className="text-title font-heading text-high-contrast mb-2">Client Management</h1>
                <p className="text-body text-medium-contrast">Manage client organizations and their information</p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-agile-teal-dark text-primary-foreground" onClick={resetForm}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Client
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>{editingClient ? "Edit Client" : "Add New Client"}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Client Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="industry">Industry</Label>
                      <Input
                        id="industry"
                        value={formData.industry}
                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="logo" className="mb-2 block">
                        Logo
                      </Label>
                      <LogoFileUploader
                        value={editingClient?.logoUrl || ""}
                        onChange={handleLogoChange}
                        emptyStateAspectRatioClass={null}
                      />
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: "active" | "inactive") => setFormData({ ...formData, status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button type="submit" className="flex-1">
                        {editingClient ? "Update Client" : "Create Client"}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </FadeInUp>

        <FadeInUp delay={0.2}>
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row gap-4 justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BuildingIcon className="h-5 w-5 text-primary" />
                  Clients ({filteredClients.length})
                </CardTitle>

                {/* Search and Filter Controls */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search clients..."
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
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
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
                      <TableHead>Logo</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Industry</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedClients.length > 0 ? (
                      paginatedClients.map((client) => (
                        <TableRow key={client.id}>
                          <TableCell>
                            <Avatar className="h-10 w-10 rounded-md">
                              {client.logoUrl ? (
                                <AvatarImage
                                  src={client.logoUrl || "/placeholder.svg"}
                                  alt={client.name}
                                  className="object-cover"
                                />
                              ) : (
                                <AvatarFallback className="rounded-md bg-muted">
                                  <BuildingIcon className="h-5 w-5 text-muted-foreground" />
                                </AvatarFallback>
                              )}
                            </Avatar>
                          </TableCell>
                          <TableCell className="font-medium">{client.name}</TableCell>
                          <TableCell>{client.industry}</TableCell>
                          <TableCell>
                            <Badge
                              variant={client.status === "active" ? "default" : "destructive"}
                              className={client.status === "active" ? "bg-green-600 text-white" : ""}
                            >
                              {client.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(client.lastUpdated)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Button size="sm" variant="outline" onClick={() => handleEdit(client)}>
                                <EditIcon className="h-4 w-4" />
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
                                      This action cannot be undone. This will permanently delete the client{" "}
                                      <span className="font-semibold">{client.name}</span> and remove their data from
                                      our servers.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(client.id)}>
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
                          No clients found matching your filters
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Controls */}
              {filteredClients.length > 0 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-muted-foreground">
                    Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredClients.length)} to{" "}
                    {Math.min(currentPage * itemsPerPage, filteredClients.length)} of {filteredClients.length} clients
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
