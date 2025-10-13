"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Edit, Trash2, Plus, Check, X } from "lucide-react"
import { useRouter } from "next/navigation"
import React from "react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
  max_profile_views_per_day: number
  unlimited_messaging: boolean
  unlimited_profile_viewing: boolean
  advanced_search_filters: boolean
  profile_boosting: boolean
  read_receipts: boolean
  profile_verification_badge: boolean
  enhanced_visibility: boolean
  compatibility_reports: boolean
  video_chat_feature: boolean
  incognito_browsing: boolean
  priority_support: boolean
  exclusive_events_access: boolean
  limited_daily_boosts: number
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
    max_profile_views_per_day: -1,
    unlimited_messaging: false,
    unlimited_profile_viewing: false,
    advanced_search_filters: false,
    profile_boosting: false,
    read_receipts: false,
    profile_verification_badge: false,
    enhanced_visibility: false,
    compatibility_reports: false,
    video_chat_feature: false,
    incognito_browsing: false,
    priority_support: false,
    exclusive_events_access: false,
    limited_daily_boosts: -1,
  }

  async function handleSave(packageData: Partial<SubscriptionPackage>) {
    setLoading(true)
    try {
      const supabase = getSupabaseBrowserClient()

      console.log("[v0] Saving package data:", packageData)

      if (editingPackage) {
        const { error } = await supabase.from("subscription_packages").update(packageData).eq("id", editingPackage.id)

        if (error) {
          console.error("[v0] Update error:", error)
          throw error
        }

        setPackages(
          packages.map((pkg) =>
            pkg.id === editingPackage.id ? ({ ...pkg, ...packageData } as SubscriptionPackage) : pkg,
          ),
        )
      } else {
        const { data, error } = await supabase.from("subscription_packages").insert([packageData]).select().single()

        if (error) {
          console.error("[v0] Insert error:", error)
          throw error
        }

        setPackages([...packages, data])
      }

      setEditingPackage(null)
      setIsCreating(false)
      router.refresh()
    } catch (error) {
      console.error("[v0] Error saving package:", error)
      alert("Failed to save package. Check console for details.")
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
                <FeatureItem
                  value={pkg.max_messages_per_day}
                  label="Messages/day"
                  unlimited={pkg.unlimited_messaging}
                />
                <FeatureItem
                  value={pkg.max_profile_views_per_day}
                  label="Profile views/day"
                  unlimited={pkg.unlimited_profile_viewing}
                />
                {pkg.advanced_search_filters && <FeatureItem enabled label="Advanced search filters" />}
                {pkg.profile_boosting && <FeatureItem enabled label="Profile boosting" />}
                {pkg.can_see_who_viewed_profile && <FeatureItem enabled label="See who viewed profile" />}
                {pkg.read_receipts && <FeatureItem enabled label="Read receipts" />}
                {pkg.profile_verification_badge && <FeatureItem enabled label="Verification badge" />}
                {pkg.enhanced_visibility && <FeatureItem enabled label="Enhanced visibility" />}
                {pkg.compatibility_reports && <FeatureItem enabled label="Compatibility reports" />}
                {pkg.video_chat_feature && <FeatureItem enabled label="Video chat" />}
                {pkg.incognito_browsing && <FeatureItem enabled label="Incognito browsing" />}
                {pkg.priority_support && <FeatureItem enabled label="Priority support" />}
                {pkg.exclusive_events_access && <FeatureItem enabled label="Exclusive events" />}
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

function FeatureItem({
  value,
  label,
  unlimited,
  enabled,
}: {
  value?: number
  label: string
  unlimited?: boolean
  enabled?: boolean
}) {
  if (enabled !== undefined) {
    return (
      <div className="flex items-center gap-2">
        {enabled ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-gray-400" />}
        <span className={enabled ? "" : "text-gray-400"}>{label}</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {unlimited || value === -1 ? (
        <Check className="h-4 w-4 text-green-600" />
      ) : (
        <span className="text-gray-600 font-medium">{value}</span>
      )}
      <span>{label}</span>
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

  React.useEffect(() => {
    console.log("[v0] Package changed, updating form data:", pkg)
    setFormData(pkg)
  }, [pkg, open])

  const handleSave = () => {
    console.log("[v0] Saving package with data:", formData)
    onSave(formData)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{pkg.id ? "Edit Package" : "Create Package"}</DialogTitle>
          <DialogDescription>Configure subscription package features and pricing</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="limits">Limits</TabsTrigger>
            <TabsTrigger value="standard">Standard</TabsTrigger>
            <TabsTrigger value="premium">Premium</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Package Name (ID)</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., premium"
                  disabled={!!pkg.id}
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

            <div className="flex items-center justify-between">
              <Label htmlFor="is_active" className="font-normal">
                Active package
              </Label>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </TabsContent>

          <TabsContent value="limits" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="messages">Messages/Day (-1 = unlimited)</Label>
                <Input
                  id="messages"
                  type="number"
                  value={formData.max_messages_per_day}
                  onChange={(e) => setFormData({ ...formData, max_messages_per_day: Number.parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="views">Profile Views/Day (-1 = unlimited)</Label>
                <Input
                  id="views"
                  type="number"
                  value={formData.max_profile_views_per_day}
                  onChange={(e) =>
                    setFormData({ ...formData, max_profile_views_per_day: Number.parseInt(e.target.value) })
                  }
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Basic Features</Label>
              {[
                { key: "basic_search_only", label: "Basic search only (no advanced filters)" },
                { key: "basic_notifications", label: "Basic push notifications" },
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
          </TabsContent>

          <TabsContent value="standard" className="space-y-4">
            <div className="space-y-3">
              <Label>Standard Package Features</Label>
              {[
                { key: "unlimited_messaging", label: "Unlimited messaging" },
                { key: "advanced_search_filters", label: "Advanced search filters" },
                { key: "profile_boosting", label: "Profile boosting (temporary)" },
                { key: "can_see_who_viewed_profile", label: "See who viewed profile" },
                { key: "access_success_stories", label: "Access to success stories" },
                { key: "read_receipts", label: "Read receipts for messages" },
              ].map((feature) => (
                <div key={feature.key} className="flex items-center justify-between rounded-lg border p-3">
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
              <div className="space-y-2">
                <Label htmlFor="daily_boosts">Limited Daily Boosts (0 = none, -1 = unlimited)</Label>
                <Input
                  id="daily_boosts"
                  type="number"
                  value={formData.limited_daily_boosts}
                  onChange={(e) => setFormData({ ...formData, limited_daily_boosts: Number.parseInt(e.target.value) })}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="premium" className="space-y-4">
            <div className="space-y-3">
              <Label>Premium Package Features</Label>
              {[
                { key: "profile_verification_badge", label: "Profile verification badge" },
                { key: "unlimited_profile_viewing", label: "Unlimited profile viewing" },
                { key: "enhanced_visibility", label: "Enhanced profile visibility in search" },
                { key: "compatibility_reports", label: "In-depth compatibility reports" },
                { key: "video_chat_feature", label: "Video chat feature" },
                { key: "matchmaker_consultation", label: "Matchmaker consultation (optional)" },
                { key: "incognito_browsing", label: "Incognito browsing" },
                { key: "priority_support", label: "Priority customer support" },
                { key: "unlimited_boosts", label: "Unlimited profile boosts" },
                { key: "exclusive_events_access", label: "Exclusive webinars and events" },
              ].map((feature) => (
                <div key={feature.key} className="flex items-center justify-between rounded-lg border p-3">
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
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Package"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
