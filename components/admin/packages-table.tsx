"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { Edit, Trash2, Plus, Check } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface SubscriptionPackage {
  id: string
  name: string
  display_name: string
  description: string | null
  price: number
  duration_months: number
  max_interest_requests_per_day: number
  max_messages_per_day: number
  can_see_who_viewed_profile: boolean
  can_see_who_liked_profile: boolean
  priority_listing: boolean
  verified_badge: boolean
  can_send_unlimited_messages: boolean
  can_view_contact_info: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

interface AdminPackagesTableProps {
  packages: SubscriptionPackage[]
}

export function AdminPackagesTable({ packages: initialPackages }: AdminPackagesTableProps) {
  const router = useRouter()
  const [packages, setPackages] = useState(initialPackages)
  const [editingPackage, setEditingPackage] = useState<SubscriptionPackage | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [loading, setLoading] = useState(false)

  const emptyPackage: Partial<SubscriptionPackage> = {
    name: "",
    display_name: "",
    description: "",
    price: 0,
    duration_months: 1,
    max_interest_requests_per_day: -1,
    max_messages_per_day: -1,
    can_see_who_viewed_profile: false,
    can_see_who_liked_profile: false,
    priority_listing: false,
    verified_badge: false,
    can_send_unlimited_messages: false,
    can_view_contact_info: false,
    is_active: true,
  }

  async function handleSave(packageData: Partial<SubscriptionPackage>) {
    setLoading(true)
    try {
      const supabase = createClient()

      if (editingPackage) {
        // Update existing package
        const { error } = await supabase.from("subscription_packages").update(packageData).eq("id", editingPackage.id)

        if (error) throw error

        setPackages(packages.map((pkg) => (pkg.id === editingPackage.id ? { ...pkg, ...packageData } : pkg)))
      } else {
        // Create new package
        const { data, error } = await supabase.from("subscription_packages").insert([packageData]).select().single()

        if (error) throw error

        setPackages([...packages, data])
      }

      setEditingPackage(null)
      setIsCreating(false)
      router.refresh()
    } catch (error) {
      console.error("Error saving package:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(packageId: string) {
    if (!confirm("Are you sure you want to delete this package?")) return

    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from("subscription_packages").delete().eq("id", packageId)

      if (error) throw error

      setPackages(packages.filter((pkg) => pkg.id !== packageId))
      router.refresh()
    } catch (error) {
      console.error("Error deleting package:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Package
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {packages.map((pkg) => (
          <Card key={pkg.id} className={!pkg.is_active ? "opacity-60" : ""}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{pkg.display_name}</CardTitle>
                  <CardDescription className="mt-1">
                    ${pkg.price}/{pkg.duration_months} month{pkg.duration_months > 1 ? "s" : ""}
                  </CardDescription>
                </div>
                <Badge variant={pkg.is_active ? "default" : "secondary"}>{pkg.is_active ? "Active" : "Inactive"}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">{pkg.description}</p>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  {pkg.max_interest_requests_per_day === -1 ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <span className="text-gray-600">{pkg.max_interest_requests_per_day}</span>
                  )}
                  <span>Interest requests/day</span>
                </div>
                <div className="flex items-center gap-2">
                  {pkg.max_messages_per_day === -1 ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <span className="text-gray-600">{pkg.max_messages_per_day}</span>
                  )}
                  <span>Messages/day</span>
                </div>
                {pkg.can_see_who_viewed_profile && (
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>See who viewed profile</span>
                  </div>
                )}
                {pkg.can_see_who_liked_profile && (
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>See who liked profile</span>
                  </div>
                )}
                {pkg.priority_listing && (
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Priority listing</span>
                  </div>
                )}
                {pkg.verified_badge && (
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Verified badge</span>
                  </div>
                )}
                {pkg.can_view_contact_info && (
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>View contact info</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button size="sm" variant="outline" onClick={() => setEditingPackage(pkg)} className="flex-1">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(pkg.id)}
                  disabled={loading}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <PackageDialog
        open={isCreating || !!editingPackage}
        onClose={() => {
          setIsCreating(false)
          setEditingPackage(null)
        }}
        package={editingPackage || emptyPackage}
        onSave={handleSave}
        loading={loading}
      />
    </div>
  )
}

function PackageDialog({
  open,
  onClose,
  package: pkg,
  onSave,
  loading,
}: {
  open: boolean
  onClose: () => void
  package: Partial<SubscriptionPackage>
  onSave: (pkg: Partial<SubscriptionPackage>) => void
  loading: boolean
}) {
  const [formData, setFormData] = useState(pkg)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{pkg.id ? "Edit Package" : "Create Package"}</DialogTitle>
          <DialogDescription>Configure subscription package features and pricing</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Package Name (ID)</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., premium"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="display_name">Display Name</Label>
              <Input
                id="display_name"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                placeholder="e.g., Premium"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Package description"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number.parseFloat(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (months)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration_months}
                onChange={(e) => setFormData({ ...formData, duration_months: Number.parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="interest_requests">Interest Requests/Day (-1 = unlimited)</Label>
              <Input
                id="interest_requests"
                type="number"
                value={formData.max_interest_requests_per_day}
                onChange={(e) =>
                  setFormData({ ...formData, max_interest_requests_per_day: Number.parseInt(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="messages">Messages/Day (-1 = unlimited)</Label>
              <Input
                id="messages"
                type="number"
                value={formData.max_messages_per_day}
                onChange={(e) => setFormData({ ...formData, max_messages_per_day: Number.parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Features</Label>
            {[
              { key: "can_see_who_viewed_profile", label: "See who viewed profile" },
              { key: "can_see_who_liked_profile", label: "See who liked profile" },
              { key: "priority_listing", label: "Priority listing in search" },
              { key: "verified_badge", label: "Verified badge" },
              { key: "can_send_unlimited_messages", label: "Unlimited messages" },
              { key: "can_view_contact_info", label: "View contact information" },
              { key: "is_active", label: "Active package" },
            ].map((feature) => (
              <div key={feature.key} className="flex items-center justify-between">
                <Label htmlFor={feature.key} className="font-normal">
                  {feature.label}
                </Label>
                <Switch
                  id={feature.key}
                  checked={formData[feature.key as keyof typeof formData] as boolean}
                  onCheckedChange={(checked) => setFormData({ ...formData, [feature.key]: checked })}
                />
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={() => onSave(formData)} disabled={loading}>
            {loading ? "Saving..." : "Save Package"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
