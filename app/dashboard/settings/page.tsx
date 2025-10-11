"use client"

import { useEffect, useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { Profile } from "@/lib/types/profile"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { LogOut, Edit2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingAccount, setEditingAccount] = useState(false)
  const [accountData, setAccountData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
  })
  const supabase = getSupabaseBrowserClient()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()
        if (data) {
          setProfile(data)
          setAccountData({
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            phone: data.phone || "",
            email: data.email || "",
          })
        }
      }
      setLoading(false)
    }
    fetchProfile()
  }, [supabase])

  const handlePrivacyUpdate = async (field: string, value: string) => {
    if (!profile) return

    setSaving(true)
    const { error } = await supabase
      .from("profiles")
      .update({ [field]: value })
      .eq("id", profile.id)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update privacy settings",
        variant: "destructive",
      })
    } else {
      setProfile({ ...profile, [field]: value } as Profile)
      toast({
        title: "Settings updated",
        description: "Your privacy settings have been updated",
      })
    }
    setSaving(false)
  }

  const handleNotificationUpdate = async (field: string, value: boolean) => {
    if (!profile) return

    const { error } = await supabase
      .from("profiles")
      .update({ [field]: value })
      .eq("id", profile.id)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update notification settings",
        variant: "destructive",
      })
    } else {
      setProfile({ ...profile, [field]: value } as Profile)
      toast({
        title: "Settings updated",
        description: "Your notification settings have been updated",
      })
    }
  }

  const handleAccountUpdate = async () => {
    if (!profile) return

    setSaving(true)
    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: accountData.first_name,
        last_name: accountData.last_name,
        phone: accountData.phone,
      })
      .eq("id", profile.id)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update account information",
        variant: "destructive",
      })
    } else {
      setProfile({
        ...profile,
        first_name: accountData.first_name,
        last_name: accountData.last_name,
        phone: accountData.phone,
      } as Profile)
      setEditingAccount(false)
      toast({
        title: "Account updated",
        description: "Your account information has been updated",
      })
    }
    setSaving(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Profile not found</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <h1 className="font-serif text-2xl font-bold">Profile settings</h1>

      {/* Profile Section */}
      <Card>
        <CardContent className="p-6">
          <h2 className="mb-4 font-serif text-lg font-semibold">Profile</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile.profile_photo || "/placeholder.svg"} />
                <AvatarFallback>
                  {profile.first_name?.[0]}
                  {profile.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">
                  {profile.first_name} {profile.last_name}
                </p>
                <p className="text-sm text-muted-foreground">{profile.living_in}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <Label className="mb-2 block">Profile visible</Label>
              <Select
                value={profile.profile_visibility || "all_users"}
                onValueChange={(value) => handlePrivacyUpdate("profile_visibility", value)}
                disabled={saving}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_users">All users</SelectItem>
                  <SelectItem value="friends">Friends only</SelectItem>
                </SelectContent>
              </Select>
              <p className="mt-1 text-sm text-muted-foreground">You can set up who can able to view your profile.</p>
            </div>

            <div>
              <Label className="mb-2 block">Who can send you interest requests?</Label>
              <Select
                value={profile.who_can_send_interest || "all_users"}
                onValueChange={(value) => handlePrivacyUpdate("who_can_send_interest", value)}
                disabled={saving}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_users">All users</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
              <p className="mt-1 text-sm text-muted-foreground">
                You can set up who can able to make interest request here.
              </p>
            </div>

            <div>
              <Label className="mb-2 block">Phone number visibility</Label>
              <Select
                value={profile.phone_visibility || "all_users"}
                onValueChange={(value) => handlePrivacyUpdate("phone_visibility", value)}
                disabled={saving}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_users">All users</SelectItem>
                  <SelectItem value="friends">Friends only</SelectItem>
                  <SelectItem value="hidden">Hidden</SelectItem>
                </SelectContent>
              </Select>
              <p className="mt-1 text-sm text-muted-foreground">Control who can see your phone number.</p>
            </div>

            <div>
              <Label className="mb-2 block">Email visibility</Label>
              <Select
                value={profile.email_visibility || "all_users"}
                onValueChange={(value) => handlePrivacyUpdate("email_visibility", value)}
                disabled={saving}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_users">All users</SelectItem>
                  <SelectItem value="friends">Friends only</SelectItem>
                  <SelectItem value="hidden">Hidden</SelectItem>
                </SelectContent>
              </Select>
              <p className="mt-1 text-sm text-muted-foreground">Control who can see your email address.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Section */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-lg font-semibold">Account</h2>
            {!editingAccount && (
              <Button variant="outline" size="sm" onClick={() => setEditingAccount(true)}>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit
              </Button>
            )}
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="mb-2 block text-muted-foreground">Full name</Label>
                {editingAccount ? (
                  <div className="flex gap-2">
                    <Input
                      value={accountData.first_name}
                      onChange={(e) => setAccountData({ ...accountData, first_name: e.target.value })}
                      placeholder="First name"
                    />
                    <Input
                      value={accountData.last_name}
                      onChange={(e) => setAccountData({ ...accountData, last_name: e.target.value })}
                      placeholder="Last name"
                    />
                  </div>
                ) : (
                  <p className="font-medium">
                    {profile.first_name} {profile.last_name}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label className="mb-2 block text-muted-foreground">Mobile</Label>
              {editingAccount ? (
                <Input
                  value={accountData.phone}
                  onChange={(e) => setAccountData({ ...accountData, phone: e.target.value })}
                  placeholder="Phone number"
                />
              ) : (
                <p className="font-medium">{profile.phone || "Not provided"}</p>
              )}
            </div>

            <div>
              <Label className="mb-2 block text-muted-foreground">Email Id</Label>
              <p className="font-medium">{profile.email}</p>
            </div>

            <div>
              <Label className="mb-2 block text-muted-foreground">Password</Label>
              <p className="font-medium">••••••••••</p>
            </div>

            <div>
              <Label className="mb-2 block text-muted-foreground">Profile-type</Label>
              <p className="font-medium capitalize">{profile.membership_plan}</p>
            </div>

            {editingAccount && (
              <div className="flex gap-2">
                <Button onClick={handleAccountUpdate} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Button variant="outline" onClick={() => setEditingAccount(false)}>
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notifications Section */}
      <Card>
        <CardContent className="p-6">
          <h2 className="mb-4 font-serif text-lg font-semibold">Notifications</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Interest request</p>
                <p className="text-sm text-muted-foreground">Interest request email notifications</p>
              </div>
              <Switch
                checked={profile.notify_interest_request ?? true}
                onCheckedChange={(checked) => handleNotificationUpdate("notify_interest_request", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Chat</p>
                <p className="text-sm text-muted-foreground">New chat notifications</p>
              </div>
              <Switch
                checked={profile.notify_chat ?? true}
                onCheckedChange={(checked) => handleNotificationUpdate("notify_chat", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Profile views</p>
                <p className="text-sm text-muted-foreground">
                  If any one view your profile means you get the notifications at end of the day
                </p>
              </div>
              <Switch
                checked={profile.notify_profile_views ?? true}
                onCheckedChange={(checked) => handleNotificationUpdate("notify_profile_views", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">New profile match</p>
                <p className="text-sm text-muted-foreground">You get the profile match emails</p>
              </div>
              <Switch
                checked={profile.notify_new_matches ?? true}
                onCheckedChange={(checked) => handleNotificationUpdate("notify_new_matches", checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
