"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { UserIcon, KeyIcon, SaveIcon } from "lucide-react"
import { ThemeToggleButton } from "@/components/theme-toggle-button"
import { AgilenesiaLogo } from "@/components/agilenesia-logo"
import { FadeInUp } from "@/components/page-transition"
import { getUserSession, logout } from "@/app/actions"
import { updateUser, updateUserPassword } from "@/lib/user-crud"
import type { User } from "@/lib/data"
import Link from "next/link"
import bcrypt from "bcryptjs"

export default function ProfilePage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Profile form data
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
  })

  // Password form data
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  useEffect(() => {
    const fetchUser = async () => {
      const session = await getUserSession()
      if (session) {
        setCurrentUser(session)
        setProfileData({
          name: session.name,
          email: session.email,
        })
      }
      setIsLoading(false)
    }

    fetchUser()
  }, [])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) return

    setIsSaving(true)
    setMessage(null)

    try {
      const updatedUser = await updateUser(currentUser.id, {
        name: profileData.name,
        email: profileData.email,
      })

      if (updatedUser) {
        setCurrentUser(updatedUser)
        setMessage({ type: "success", text: "Profile updated successfully!" })
      } else {
        setMessage({ type: "error", text: "Failed to update profile. Please try again." })
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      setMessage({ type: "error", text: "An error occurred while updating profile." })
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) return

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match." })
      return
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: "error", text: "New password must be at least 6 characters long." })
      return
    }

    setIsSaving(true)
    setMessage(null)

    try {
      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(passwordData.currentPassword, currentUser.password)

      if (!isCurrentPasswordValid) {
        setMessage({ type: "error", text: "Current password is incorrect." })
        setIsSaving(false)
        return
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10)
      const hashedNewPassword = await bcrypt.hash(passwordData.newPassword, salt)

      // Update password
      const success = await updateUserPassword(currentUser.id, hashedNewPassword)

      if (success) {
        setMessage({ type: "success", text: "Password updated successfully!" })
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
      } else {
        setMessage({ type: "error", text: "Failed to update password. Please try again." })
      }
    } catch (error) {
      console.error("Error updating password:", error)
      setMessage({ type: "error", text: "An error occurred while updating password." })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg mb-4">Please log in to view your profile.</p>
          <Link href="/login">
            <Button>Go to Login</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background text-foreground min-h-screen">
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
          <AgilenesiaLogo />
          <nav className="ml-auto flex gap-2 sm:gap-4 items-center">
            <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
              Home
            </Link>
            {currentUser?.role === "admin" && (
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
            <Link href="/profile" className="text-sm font-medium text-primary">
              Profile
            </Link>
            <ThemeToggleButton />
            <Button
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10 bg-transparent"
              onClick={() => logout()}
            >
              Logout
            </Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8 lg:p-12 max-w-4xl">
        <FadeInUp>
          <div className="mb-8">
            <h1 className="text-title font-heading text-high-contrast mb-2">Profile Settings</h1>
            <p className="text-body text-medium-contrast">Manage your account information and security settings</p>
          </div>
        </FadeInUp>

        {message && (
          <FadeInUp delay={0.1}>
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {message.text}
            </div>
          </FadeInUp>
        )}

        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {/* Profile Information */}
          <FadeInUp delay={0.2}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5 text-primary" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Role</Label>
                    <Input value={currentUser.role} disabled className="bg-muted" />
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Input value={currentUser.status} disabled className="bg-muted" />
                  </div>
                  <Button type="submit" disabled={isSaving} className="w-full">
                    <SaveIcon className="h-4 w-4 mr-2" />
                    {isSaving ? "Saving..." : "Save Profile"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </FadeInUp>

          {/* Password Change */}
          <FadeInUp delay={0.3}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <KeyIcon className="h-5 w-5 text-primary" />
                  Change Password
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      required
                    />
                  </div>
                  <Separator />
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      required
                      minLength={6}
                    />
                    <p className="text-sm text-muted-foreground mt-1">Password must be at least 6 characters long</p>
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      required
                      minLength={6}
                    />
                  </div>
                  <Button type="submit" disabled={isSaving} className="w-full">
                    <KeyIcon className="h-4 w-4 mr-2" />
                    {isSaving ? "Updating..." : "Update Password"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </FadeInUp>
        </div>
      </main>
    </div>
  )
}
