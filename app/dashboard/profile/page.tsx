"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { Profile } from "@/lib/types/profile"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Heart, Eye, Users, MousePointer, Edit } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [likesCount, setLikesCount] = useState(0)
  const [interestsCount, setInterestsCount] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const supabase = getSupabaseBrowserClient()
  const router = useRouter()

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()
        if (data) setProfile(data)

        const { count: likes } = await supabase
          .from("profile_likes")
          .select("*", { count: "exact", head: true })
          .eq("liked_profile_id", user.id)
        setLikesCount(likes || 0)

        const { count: interests } = await supabase
          .from("interest_requests")
          .select("*", { count: "exact", head: true })
          .eq("receiver_id", user.id)
        setInterestsCount(interests || 0)
      }
      setLoading(false)
    }
    fetchProfile()
  }, [supabase])

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !profile) return

    setIsUploading(true)

    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${profile.id}-${Date.now()}.${fileExt}`
      const filePath = `gallery/${fileName}`

      const { error: uploadError } = await supabase.storage.from("profile-photos").upload(filePath, file)

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from("profile-photos").getPublicUrl(filePath)

      const updatedGallery = [...(profile.photo_gallery || []), publicUrl]

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ photo_gallery: updatedGallery })
        .eq("id", profile.id)

      if (updateError) throw updateError

      setProfile({ ...profile, photo_gallery: updatedGallery })
    } catch (error: any) {
      console.error("[v0] Error uploading photo:", error)
    } finally {
      setIsUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Profile not found</p>
        </div>
      </div>
    )
  }

  const age = profile.date_of_birth ? new Date().getFullYear() - new Date(profile.date_of_birth).getFullYear() : null

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Profile Header Card */}
      <Card className="overflow-hidden">
        <div
          className="relative h-32"
          style={{
            backgroundImage: `url(${profile.cover_photo || "/default-cover.png"})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-4 top-4 bg-white/20 text-white hover:bg-white/30"
            onClick={() => router.push("/dashboard/profile/edit")}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
        <CardContent className="relative px-6 pb-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end">
            <Avatar className="h-32 w-32 -mt-16 border-4 border-card">
              <AvatarImage src={profile.profile_photo || "/placeholder.svg"} />
              <AvatarFallback className="bg-primary text-4xl text-primary-foreground">
                {profile.first_name?.[0]}
                {profile.last_name?.[0]}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center sm:text-left">
              <h2 className="font-serif text-2xl font-bold">
                {profile.first_name} {profile.last_name}
              </h2>
              <p className="text-sm text-muted-foreground">
                @{profile.first_name?.toLowerCase()} | Joined{" "}
                {new Date(profile.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
              </p>
              <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {profile.membership_plan === "free" ? "Free User" : profile.membership_plan}
                </Badge>
                {profile.membership_plan !== "free" && (
                  <Button size="sm" variant="outline">
                    Upgrade plan
                  </Button>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push(`/profile/${profile.id}`)}>
                View full Profile
              </Button>
              <Button onClick={() => router.push("/dashboard/profile/edit")}>Edit your profile</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Stats */}
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <h3 className="mb-4 font-serif text-lg font-semibold">Profile status</h3>
            <div className="space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">Profile completion</span>
                  <span className="text-2xl font-bold text-primary">{profile.profile_completion}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${profile.profile_completion}%` }}
                  />
                </div>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div
                      className={`h-2 w-2 rounded-full ${profile.interests_received > 0 ? "bg-primary" : "bg-muted"}`}
                    />
                    <span className={profile.interests_received > 0 ? "text-foreground" : "text-muted-foreground"}>
                      Interests
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className={`h-2 w-2 rounded-full ${profile.profile_photo ? "bg-primary" : "bg-muted"}`} />
                    <span className={profile.profile_photo ? "text-foreground" : "text-muted-foreground"}>
                      Profile photo
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className={`h-2 w-2 rounded-full ${profile.about_me ? "bg-primary" : "bg-muted"}`} />
                    <span className={profile.about_me ? "text-foreground" : "text-muted-foreground"}>Socials</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        profile.photo_gallery && profile.photo_gallery.length > 0 ? "bg-primary" : "bg-muted"
                      }`}
                    />
                    <span
                      className={
                        profile.photo_gallery && profile.photo_gallery.length > 0
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }
                    >
                      More data
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                    <Heart className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{likesCount}</p>
                    <p className="text-xs text-muted-foreground">Likes</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                    <Eye className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{profile.profile_views || 0}</p>
                    <p className="text-xs text-muted-foreground">Views</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100">
                    <Users className="h-5 w-5 text-pink-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{interestsCount}</p>
                    <p className="text-xs text-muted-foreground">Interests</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                    <MousePointer className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{profile.clicks_received || 0}</p>
                    <p className="text-xs text-muted-foreground">Clicks</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* My Photo Gallery */}
        <Card>
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-serif text-lg font-semibold">My Photo Gallery</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {profile.photo_gallery && profile.photo_gallery.length > 0 ? (
                <>
                  {profile.photo_gallery.slice(0, 3).map((photo, index) => (
                    <div key={index} className="aspect-square overflow-hidden rounded-lg">
                      <img
                        src={photo || "/placeholder.svg"}
                        alt={`Gallery ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                  <label className="flex aspect-square cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border hover:border-primary hover:bg-primary/5">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
                      disabled={isUploading}
                    />
                    <div className="text-center">
                      <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <span className="text-xl">{isUploading ? "..." : "+"}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Upload Image</p>
                    </div>
                  </label>
                </>
              ) : (
                <div className="col-span-2 flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-border">
                  <label className="cursor-pointer text-center">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
                      disabled={isUploading}
                    />
                    <p className="text-sm text-muted-foreground">No photos yet</p>
                    <Button size="sm" variant="link" className="mt-2" type="button">
                      {isUploading ? "Uploading..." : "Upload photos"}
                    </Button>
                  </label>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
