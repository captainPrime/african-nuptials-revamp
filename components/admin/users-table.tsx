"use client"

import { useState } from "react"
import type { Profile } from "@/lib/types/profile"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { Eye, Ban, CheckCircle, Search, Trash2, Edit, Plus, Package } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"

interface AdminUsersTableProps {
  users: Profile[]
}

export function AdminUsersTable({ users: initialUsers }: AdminUsersTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [users, setUsers] = useState(initialUsers)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState<string | null>(null)
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null)
  const [assignPackageUserId, setAssignPackageUserId] = useState<string | null>(null)
  const [selectedPackageId, setSelectedPackageId] = useState<string>("")
  const [packages, setPackages] = useState<any[]>([])
  const [showCreateUser, setShowCreateUser] = useState(false)
  const [editingUser, setEditingUser] = useState<Profile | null>(null)
  const [editFormData, setEditFormData] = useState<Partial<Profile>>({})

  async function loadPackages() {
    console.log("[v0] Loading packages for assignment...")
    const supabase = createClient()
    const { data, error } = await supabase
      .from("subscription_packages")
      .select("*")
      .eq("is_active", true)
      .order("price")

    console.log("[v0] Packages loaded:", data, "Error:", error)
    if (data) {
      setPackages(data)
    } else {
      console.error("[v0] Failed to load packages:", error)
      toast({
        title: "Error",
        description: "Failed to load packages",
        variant: "destructive",
      })
    }
  }

  async function toggleUserStatus(userId: string, currentStatus: boolean) {
    setLoading(userId)
    try {
      const supabase = createClient()
      const { error } = await supabase.from("profiles").update({ is_active: !currentStatus }).eq("id", userId)

      if (error) throw error

      setUsers(users.map((user) => (user.id === userId ? { ...user, is_active: !currentStatus } : user)))
    } catch (error) {
      console.error("Error toggling user status:", error)
    } finally {
      setLoading(null)
    }
  }

  async function toggleFeaturedStatus(userId: string, currentStatus: boolean) {
    setLoading(userId)
    try {
      const supabase = createClient()
      const { error } = await supabase.from("profiles").update({ is_featured: !currentStatus }).eq("id", userId)

      if (error) throw error

      setUsers(users.map((user) => (user.id === userId ? { ...user, is_featured: !currentStatus } : user)))

      toast({
        title: "Featured status updated",
        description: `User ${!currentStatus ? "added to" : "removed from"} featured profiles`,
      })
    } catch (error) {
      console.error("Error toggling featured status:", error)
      toast({
        title: "Error",
        description: "Failed to update featured status",
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  async function deleteUser() {
    if (!deleteUserId) return

    setLoading(deleteUserId)
    try {
      const supabase = createClient()
      const { error } = await supabase.from("profiles").delete().eq("id", deleteUserId)

      if (error) throw error

      setUsers(users.filter((user) => user.id !== deleteUserId))
      setDeleteUserId(null)
    } catch (error) {
      console.error("Error deleting user:", error)
    } finally {
      setLoading(null)
    }
  }

  async function assignPackage() {
    if (!assignPackageUserId || !selectedPackageId) {
      toast({
        title: "Error",
        description: "Please select a package",
        variant: "destructive",
      })
      return
    }

    setLoading(assignPackageUserId)
    try {
      const supabase = createClient()

      console.log("[v0] Assigning package:", selectedPackageId, "to user:", assignPackageUserId)

      const { error: deactivateError } = await supabase
        .from("user_subscriptions")
        .update({ is_active: false })
        .eq("user_id", assignPackageUserId)
        .eq("is_active", true)

      if (deactivateError) {
        console.error("[v0] Error deactivating subscriptions:", deactivateError)
      }

      const { data: packageData, error: packageError } = await supabase
        .from("subscription_packages")
        .select("*")
        .eq("id", selectedPackageId)
        .single()

      if (packageError || !packageData) {
        console.error("[v0] Error fetching package:", packageError)
        throw new Error("Package not found")
      }

      console.log("[v0] Package data:", packageData)

      const endDate = new Date()
      endDate.setMonth(endDate.getMonth() + packageData.duration_months)

      const { error: insertError } = await supabase.from("user_subscriptions").insert({
        user_id: assignPackageUserId,
        package_id: selectedPackageId,
        end_date: endDate.toISOString(),
        is_active: true,
        amount_paid: packageData.price,
        payment_status: "completed",
        payment_method: "admin_assigned",
      })

      if (insertError) {
        console.error("[v0] Error inserting subscription:", insertError)
        throw insertError
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ membership_plan: packageData.name })
        .eq("id", assignPackageUserId)

      if (updateError) {
        console.error("[v0] Error updating profile:", updateError)
      }

      console.log("[v0] Package assigned successfully")

      toast({
        title: "Package assigned",
        description: "User subscription has been updated successfully",
      })

      setAssignPackageUserId(null)
      setSelectedPackageId("")
      router.refresh()
    } catch (error: any) {
      console.error("[v0] Error assigning package:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to assign package",
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  async function handleEditUser() {
    if (!editingUser) return

    setLoading(editingUser.id)
    try {
      const supabase = createClient()
      const { error } = await supabase.from("profiles").update(editFormData).eq("id", editingUser.id)

      if (error) throw error

      setUsers(users.map((user) => (user.id === editingUser.id ? { ...user, ...editFormData } : user)))

      toast({
        title: "User updated",
        description: "User profile has been updated successfully",
      })

      setEditingUser(null)
      setEditFormData({})
      router.refresh()
    } catch (error) {
      console.error("Error updating user:", error)
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setShowCreateUser(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Package</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {user.first_name} {user.last_name}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell className="capitalize">{user.gender}</TableCell>
                <TableCell>
                  <Badge variant={user.membership_plan === "premium" ? "default" : "secondary"}>
                    {user.membership_plan || "basic"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={user.is_active ? "default" : "destructive"}>
                    {user.is_active ? "Active" : "Deactivated"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={user.is_featured ? "default" : "secondary"}
                    className="cursor-pointer"
                    onClick={() => toggleFeaturedStatus(user.id, user.is_featured || false)}
                  >
                    {user.is_featured ? "Featured" : "Not Featured"}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/profile/${user.id}`}>
                      <Button size="sm" variant="ghost">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingUser(user)
                        setEditFormData({
                          first_name: user.first_name,
                          last_name: user.last_name,
                          email: user.email,
                          phone: user.phone,
                          bio: user.bio,
                          living_in: user.living_in,
                          religion: user.religion,
                          community: user.community,
                        })
                      }}
                      title="Edit User"
                    >
                      <Edit className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setAssignPackageUserId(user.id)
                        loadPackages()
                      }}
                      title="Assign Package"
                    >
                      <Package className="h-4 w-4 text-purple-600" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleUserStatus(user.id, user.is_active)}
                      disabled={loading === user.id}
                      title={user.is_active ? "Deactivate User" : "Activate User"}
                    >
                      {user.is_active ? (
                        <Ban className="h-4 w-4 text-red-600" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeleteUserId(user.id)}
                      disabled={loading === user.id}
                      title="Delete User"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit User Profile</DialogTitle>
            <DialogDescription>Update user profile information</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-first-name">First Name</Label>
                <Input
                  id="edit-first-name"
                  value={editFormData.first_name || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, first_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-last-name">Last Name</Label>
                <Input
                  id="edit-last-name"
                  value={editFormData.last_name || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, last_name: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editFormData.email || ""}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                value={editFormData.phone || ""}
                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-bio">Bio</Label>
              <Textarea
                id="edit-bio"
                value={editFormData.bio || ""}
                onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-living-in">Living In</Label>
                <Input
                  id="edit-living-in"
                  value={editFormData.living_in || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, living_in: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-religion">Religion</Label>
                <Input
                  id="edit-religion"
                  value={editFormData.religion || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, religion: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-community">Community</Label>
                <Input
                  id="edit-community"
                  value={editFormData.community || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, community: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button onClick={handleEditUser} disabled={loading === editingUser?.id}>
              {loading === editingUser?.id ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!assignPackageUserId}
        onOpenChange={(open) => {
          if (!open) {
            setAssignPackageUserId(null)
            setSelectedPackageId("")
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Package</DialogTitle>
            <DialogDescription>Select a subscription package for this user</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Package</Label>
              <Select value={selectedPackageId} onValueChange={setSelectedPackageId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a package" />
                </SelectTrigger>
                <SelectContent>
                  {packages.length === 0 ? (
                    <div className="p-2 text-sm text-gray-500">Loading packages...</div>
                  ) : (
                    packages.map((pkg) => (
                      <SelectItem key={pkg.id} value={pkg.id}>
                        {pkg.display_name} - ${pkg.price}/{pkg.duration_months}mo
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {packages.length === 0 && <p className="text-sm text-gray-500">Click to load packages...</p>}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAssignPackageUserId(null)
                setSelectedPackageId("")
              }}
            >
              Cancel
            </Button>
            <Button onClick={assignPackage} disabled={!selectedPackageId || loading === assignPackageUserId}>
              {loading === assignPackageUserId ? "Assigning..." : "Assign Package"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteUser} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
