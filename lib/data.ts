export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "client"
  clientId?: string
  created_at?: string
  updated_at?: string
}

export interface Client {
  id: string
  name: string
  logoUrl?: string
  created_at?: string
  updated_at?: string
}

export interface Project {
  id: string
  title: string
  clientId?: string
  clientName: string
  clientLogoUrl?: string
  category: string
  duration: string
  description: string
  status: "draft" | "published"
  products: Product[]
  coachingImageUrl?: string
  galleryImages?: string[]
  squad: TeamMember[]
  agilenesiaSquad: TeamMember[]
  lastUpdated: string
  clients?: Client
}

export interface Product {
  name: string
  description: string
  logoUrl?: string
}

export interface TeamMember {
  name: string
  role: string
  avatarUrl?: string
}

// Mock data for development
export const clients: Client[] = [
  {
    id: "1",
    name: "TechCorp Indonesia",
    logoUrl: "/placeholder-logo.png",
  },
  {
    id: "2",
    name: "Digital Solutions Ltd",
    logoUrl: "/placeholder-logo.png",
  },
  {
    id: "3",
    name: "Innovation Hub",
    logoUrl: "/placeholder-logo.png",
  },
]

export const users: User[] = [
  {
    id: "1",
    email: "admin@agilenesia.com",
    name: "Admin User",
    role: "admin",
  },
  {
    id: "2",
    email: "client@techcorp.com",
    name: "John Doe",
    role: "client",
    clientId: "1",
  },
  {
    id: "3",
    email: "client@digitalsolutions.com",
    name: "Jane Smith",
    role: "client",
    clientId: "2",
  },
]

export const projects: Project[] = [
  {
    id: "1",
    title: "Digital Transformation Initiative",
    clientId: "1",
    clientName: "TechCorp Indonesia",
    clientLogoUrl: "/placeholder-logo.png",
    category: "Digital Transformation",
    duration: "12 months",
    description:
      "<p>A comprehensive digital transformation program focusing on agile methodologies, DevOps practices, and organizational change management.</p>",
    status: "published",
    products: [
      {
        name: "Customer Portal",
        description: "Modern web application for customer self-service",
        logoUrl: "/placeholder-logo.png",
      },
      {
        name: "Mobile App",
        description: "iOS and Android application for on-the-go access",
        logoUrl: "/placeholder-logo.png",
      },
    ],
    coachingImageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=600&fit=crop",
    ],
    squad: [
      {
        name: "Alice Johnson",
        role: "Product Owner",
        avatarUrl: "/placeholder-user.jpg",
      },
      {
        name: "Bob Wilson",
        role: "Scrum Master",
        avatarUrl: "/placeholder-user.jpg",
      },
      {
        name: "Carol Davis",
        role: "Developer",
        avatarUrl: "/placeholder-user.jpg",
      },
    ],
    agilenesiaSquad: [
      {
        name: "David Chen",
        role: "Agile Coach",
        avatarUrl: "/placeholder-user.jpg",
      },
      {
        name: "Emma Rodriguez",
        role: "Technical Consultant",
        avatarUrl: "/placeholder-user.jpg",
      },
    ],
    lastUpdated: "2024-01-15",
  },
  {
    id: "2",
    title: "Agile Adoption Program",
    clientId: "2",
    clientName: "Digital Solutions Ltd",
    clientLogoUrl: "/placeholder-logo.png",
    category: "Agile Coaching",
    duration: "8 months",
    description:
      "<p>Comprehensive agile adoption program including Scrum training, coaching, and organizational transformation.</p>",
    status: "published",
    products: [
      {
        name: "E-commerce Platform",
        description: "Scalable online marketplace solution",
        logoUrl: "/placeholder-logo.png",
      },
    ],
    coachingImageUrl: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=600&fit=crop",
    galleryImages: ["https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=600&fit=crop"],
    squad: [
      {
        name: "Frank Miller",
        role: "Product Manager",
        avatarUrl: "/placeholder-user.jpg",
      },
      {
        name: "Grace Lee",
        role: "UX Designer",
        avatarUrl: "/placeholder-user.jpg",
      },
    ],
    agilenesiaSquad: [
      {
        name: "Henry Kim",
        role: "Agile Coach",
        avatarUrl: "/placeholder-user.jpg",
      },
    ],
    lastUpdated: "2024-01-10",
  },
]
