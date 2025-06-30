export interface TeamMember {
  name: string
  role: string
  avatarUrl: string
}

export interface ProjectImage {
  url: string
  alt: string
  caption?: string
}

export interface Project {
  id: string
  title: string
  clientName: string
  clientId?: string
  clientLogoUrl: string
  coachingImageUrl: string
  galleryImages?: ProjectImage[] // Add this new field
  products: string[]
  category: string
  duration: string
  description: string
  squad: TeamMember[]
  agilenesiaSquad?: TeamMember[] // Add agilenesiaSquad to the Project interface
}

export interface Client {
  id: string
  name: string
  industry: string
  logoUrl?: string
  status: "active" | "inactive"
  lastUpdated: string
}

export interface User {
  id: string
  name: string
  email: string
  password: string // In a real app, store hashed passwords
  role: "admin" | "client"
  status: "active" | "inactive"
  lastUpdated: string
  clientId?: string // Reference to client
}

export const clients: Client[] = [
  {
    id: "tumbuh-x",
    name: "Tumbuh X",
    industry: "Technology",
    logoUrl: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=120&h=40&fit=crop&crop=center",
    status: "active",
    lastUpdated: "2024-01-15T10:30:00Z",
  },
  {
    id: "fintech-startup",
    name: "Fintech Startup",
    industry: "Finance",
    logoUrl: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=120&h=40&fit=crop&crop=center",
    status: "active",
    lastUpdated: "2024-01-10T14:20:00Z",
  },
  {
    id: "global-corp",
    name: "Global Corp",
    industry: "Enterprise",
    logoUrl: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=120&h=40&fit=crop&crop=center",
    status: "active",
    lastUpdated: "2023-12-20T09:15:00Z",
  },
  {
    id: "tech-innovators",
    name: "Tech Innovators",
    industry: "Technology",
    status: "active",
    lastUpdated: "2024-01-05T11:45:00Z",
  },
  {
    id: "health-plus",
    name: "Health Plus",
    industry: "Healthcare",
    status: "inactive",
    lastUpdated: "2023-12-10T13:25:00Z",
  },
  {
    id: "edu-learn",
    name: "EduLearn",
    industry: "Education",
    status: "active",
    lastUpdated: "2024-01-08T09:15:00Z",
  },
  {
    id: "retail-max",
    name: "Retail Max",
    industry: "Retail",
    status: "active",
    lastUpdated: "2024-01-14T16:40:00Z",
  },
  {
    id: "green-energy",
    name: "Green Energy Solutions",
    industry: "Energy",
    status: "inactive",
    lastUpdated: "2023-11-30T10:20:00Z",
  },
  {
    id: "travel-go",
    name: "TravelGo",
    industry: "Travel",
    status: "active",
    lastUpdated: "2024-01-03T14:10:00Z",
  },
  {
    id: "food-delight",
    name: "Food Delight",
    industry: "Food & Beverage",
    status: "active",
    lastUpdated: "2024-01-07T11:30:00Z",
  },
]

export const users: User[] = [
  {
    id: "admin1",
    name: "Admin User",
    email: "admin@agilenesia.com",
    password: "adminpassword", // Use hashed passwords in production!
    role: "admin",
    status: "active",
    lastUpdated: "2024-01-15T10:30:00Z",
  },
  {
    id: "client1",
    name: "Client User",
    email: "client@agilenesia.com",
    password: "clientpassword", // Use hashed passwords in production!
    role: "client",
    status: "active",
    lastUpdated: "2024-01-10T14:20:00Z",
    clientId: "tumbuh-x",
  },
  {
    id: "client2",
    name: "John Doe",
    email: "john.doe@example.com",
    password: "password123",
    role: "client",
    status: "inactive",
    lastUpdated: "2023-12-20T09:15:00Z",
    clientId: "fintech-startup",
  },
  {
    id: "client3",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    password: "password123",
    role: "client",
    status: "active",
    lastUpdated: "2024-01-05T11:45:00Z",
    clientId: "global-corp",
  },
  {
    id: "admin2",
    name: "Super Admin",
    email: "super.admin@agilenesia.com",
    password: "adminpassword",
    role: "admin",
    status: "active",
    lastUpdated: "2024-01-18T08:30:00Z",
  },
  {
    id: "client4",
    name: "Robert Johnson",
    email: "robert@techinn.com",
    password: "password123",
    role: "client",
    status: "active",
    lastUpdated: "2024-01-12T15:20:00Z",
    clientId: "tech-innovators",
  },
  {
    id: "client5",
    name: "Sarah Williams",
    email: "sarah@healthplus.com",
    password: "password123",
    role: "client",
    status: "inactive",
    lastUpdated: "2023-12-10T13:25:00Z",
    clientId: "health-plus",
  },
  {
    id: "client6",
    name: "Michael Brown",
    email: "michael@edulearn.com",
    password: "password123",
    role: "client",
    status: "active",
    lastUpdated: "2024-01-08T09:15:00Z",
    clientId: "edu-learn",
  },
  {
    id: "client7",
    name: "Emily Davis",
    email: "emily@retailmax.com",
    password: "password123",
    role: "client",
    status: "active",
    lastUpdated: "2024-01-14T16:40:00Z",
    clientId: "retail-max",
  },
  {
    id: "client8",
    name: "David Wilson",
    email: "david@greenenergy.com",
    password: "password123",
    role: "client",
    status: "inactive",
    lastUpdated: "2023-11-30T10:20:00Z",
    clientId: "green-energy",
  },
  {
    id: "client9",
    name: "Lisa Taylor",
    email: "lisa@travelgo.com",
    password: "password123",
    role: "client",
    status: "active",
    lastUpdated: "2024-01-03T14:10:00Z",
    clientId: "travel-go",
  },
  {
    id: "client10",
    name: "Kevin Martinez",
    email: "kevin@fooddelight.com",
    password: "password123",
    role: "client",
    status: "active",
    lastUpdated: "2024-01-07T11:30:00Z",
    clientId: "food-delight",
  },
]

export const projects: Project[] = [
  {
    id: "tumbuh-x-client",
    title: "Agile Coaching for Digital Transformation",
    clientName: "Tumbuh X",
    clientId: "tumbuh-x",
    clientLogoUrl: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=120&h=40&fit=crop&crop=center",
    coachingImageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=900&h=500&fit=crop&crop=center",
    galleryImages: [
      {
        url: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=900&h=500&fit=crop&crop=center",
        alt: "Team planning session",
        caption: "Strategic planning session with the leadership team",
      },
      {
        url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=900&h=500&fit=crop&crop=center",
        alt: "Whiteboard session",
        caption: "Collaborative whiteboard session for process improvement",
      },
      {
        url: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=900&h=500&fit=crop&crop=center",
        alt: "Team retrospective",
        caption: "Sprint retrospective meeting with development team",
      },
      {
        url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900&h=500&fit=crop&crop=center",
        alt: "Team collaboration",
        caption: "Cross-functional team collaboration session",
      },
      {
        url: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=900&h=500&fit=crop&crop=center",
        alt: "Data analysis",
        caption: "Data-driven decision making workshop",
      },
    ],
    products: ["Agile Coaching", "Scrum Training", "Kanban Implementation"],
    category: "Enterprise Agile Coaching",
    duration: "6 Months (Jan 2024 - Jun 2024)",
    description: `
      <h1>Contoh Deskripsi Proyek</h1>
      <p>Ini adalah <strong>deskripsi proyek</strong> yang diedit menggunakan <em>Rich Text Editor</em>. Anda bisa <u>memformat teks</u> dengan mudah.</p>
      <h2>Fitur Pemformatan:</h2>
      <ul>
        <li>Teks <b>Tebal</b></li>
        <li>Teks <i>Miring</i></li>
        <li>Teks <u>Garis Bawah</u></li>
        <li>Daftar Berpoin</li>
        <li>Daftar Bernomor</li>
      </ul>
      <h3>Daftar Bernomor:</h3>
      <ol>
        <li>Item pertama</li>
        <li>Item kedua</li>
        <li>Item ketiga</li>
      </ol>
      <p style="text-align: center;">Teks ini diatur rata tengah.</p>
      <p style="text-align: right;">Teks ini diatur rata kanan.</p>
      <p>Kunjungi <a href="https://www.agilenesia.com" target="_blank">Website Agilenesia</a> untuk informasi lebih lanjut.</p>
    `, // Updated description with rich text example
    squad: [
      {
        name: "Andi Wijaya",
        role: "Lead Agile Coach",
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      },
      {
        name: "Bunga Citra",
        role: "Scrum Master",
        avatarUrl: "",
      },
      {
        name: "Charlie Dharma",
        role: "Kanban Specialist",
        avatarUrl: "", // Contoh gambar kosong
      },
      {
        name: "Dewi Lestari",
        role: "Product Management Coach",
        avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
      },
    ],
    agilenesiaSquad: [
      // Initial Agilenesia Squad for this project
      {
        name: "Rizky Pratama",
        role: "Founder & CEO",
        avatarUrl: "/placeholder.svg?height=40&width=40",
      },
      {
        name: "Siti Aminah",
        role: "Head of Operations",
        avatarUrl: "/placeholder.svg?height=40&width=40",
      },
      {
        name: "Budi Santoso",
        role: "Senior Agile Consultant",
        avatarUrl: "/placeholder.svg?height=40&width=40",
      },
    ],
  },
  {
    id: "fintech-startup-boost",
    title: "Startup Mentorship & Product Strategy",
    clientName: "Fintech Startup",
    clientId: "fintech-startup",
    clientLogoUrl: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=120&h=40&fit=crop&crop=center",
    coachingImageUrl: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=900&h=500&fit=crop&crop=center",
    galleryImages: [
      {
        url: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=900&h=500&fit=crop&crop=center",
        alt: "Product strategy session",
        caption: "Product strategy workshop with the founding team",
      },
      {
        url: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=900&h=500&fit=crop&crop=center",
        alt: "User journey mapping",
        caption: "User journey mapping exercise",
      },
      {
        url: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=900&h=500&fit=crop&crop=center",
        alt: "Development planning",
        caption: "Technical architecture planning session",
      },
    ],
    products: ["Product Discovery", "Go-to-Market Strategy"],
    category: "Startup Coaching",
    duration: "3 Months (Mar 2024 - May 2024)",
    description:
      "We partnered with a promising fintech startup to refine their product vision and develop a robust go-to-market strategy. The coaching involved intensive workshops on product discovery, user journey mapping, and competitive analysis. Our team provided hands-on mentorship to the founders, helping them navigate the complexities of the fintech landscape and secure their first round of seed funding.",
    squad: [
      {
        name: "Eka Kurniawan",
        role: "Lead Product Coach",
        avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face",
      },
      {
        name: "Fara Quincy",
        role: "Market Analyst",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop&crop=face",
      },
    ],
    agilenesiaSquad: [
      // Initial Agilenesia Squad for this project
      {
        name: "Rizky Pratama",
        role: "Founder & CEO",
        avatarUrl: "/placeholder.svg?height=40&width=40",
      },
      {
        name: "Siti Aminah",
        role: "Head of Operations",
        avatarUrl: "/placeholder.svg?height=40&width=40",
      },
    ],
  },
  {
    id: "enterprise-transformation",
    title: "Enterprise Digital Transformation",
    clientName: "Global Corp",
    clientId: "global-corp",
    clientLogoUrl: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=120&h=40&fit=crop&crop=center",
    coachingImageUrl: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=900&h=500&fit=crop&crop=center",
    galleryImages: [
      {
        url: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=900&h=500&fit=crop&crop=center",
        alt: "Executive workshop",
        caption: "Executive leadership transformation workshop",
      },
      {
        url: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=900&h=500&fit=crop&crop=center",
        alt: "Team meeting",
        caption: "Cross-departmental alignment meeting",
      },
      {
        url: "https://images.unsplash.com/photo-1573164713712-03790a178651?w=900&h=500&fit=crop&crop=center",
        alt: "Digital strategy",
        caption: "Digital strategy roadmapping session",
      },
      {
        url: "https://images.unsplash.com/photo-1552581234-26160f608093?w=900&h=500&fit=crop&crop=center",
        alt: "Training session",
        caption: "Agile methodology training for management",
      },
    ],
    products: ["Digital Strategy", "Change Management", "Leadership Coaching"],
    category: "Enterprise Transformation",
    duration: "12 Months (Jun 2023 - Jun 2024)",
    description:
      "A large-scale digital transformation initiative for a multinational corporation. Our team worked across multiple departments to implement agile methodologies, modernize workflows, and establish a culture of continuous improvement. The project involved training over 200 employees and resulted in significant improvements in operational efficiency and customer satisfaction.",
    squad: [
      {
        name: "Gita Sari",
        role: "Transformation Lead",
        avatarUrl: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=40&h=40&fit=crop&crop=face",
      },
      {
        name: "Hendra Kusuma",
        role: "Change Management Specialist",
        avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=40&h=40&fit=crop&crop=face",
      },
      {
        name: "Indira Putri",
        role: "Digital Strategy Consultant",
        avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face",
      },
    ],
    agilenesiaSquad: [
      // Initial Agilenesia Squad for this project
      {
        name: "Rizky Pratama",
        role: "Founder & CEO",
        avatarUrl: "/placeholder.svg?height=40&width=40",
      },
      {
        name: "Budi Santoso",
        role: "Senior Agile Consultant",
        avatarUrl: "/placeholder.svg?height=40&width=40",
      },
    ],
  },
]

export const getProjectById = (id: string): Project | undefined => {
  return projects.find((p) => p.id === id)
}

export const getUserById = (id: string): User | undefined => {
  return users.find((u) => u.id === id)
}

export const getClientById = (id: string): Client | undefined => {
  return clients.find((c) => c.id === id)
}

export const getClientNameById = (id?: string): string => {
  if (!id) return "None"
  const client = clients.find((c) => c.id === id)
  return client ? client.name : "Unknown Client"
}
