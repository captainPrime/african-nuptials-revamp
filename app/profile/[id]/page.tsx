"use client"

import { useEffect, useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { Profile } from "@/lib/types/profile"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Heart, MessageSquare, Share2, Facebook, Twitter, Instagram, Linkedin, MapPin, Briefcase } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function PublicProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [currentUser, setCurrentUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [sendingInterest, setSendingInterest] = useState(false)
  const [interestStatus, setInterestStatus] = useState<string | null>(null)
  const [isLiked, setIsLiked] = useState(false)
  const supabase = getSupabaseBrowserClient()
  const params = useParams()
  const { toast } = useToast()

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: currentUserProfile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
        if (currentUserProfile) setCurrentUser(currentUserProfile)

        // Check if interest request already exists
        const { data: existingRequest } = await supabase
          .from("interest_requests")
          .select("status")
          .eq("sender_id", user.id)
          .eq("receiver_id", params.id as string)
          .single()

        if (existingRequest) {
          setInterestStatus(existingRequest.status)
        }

        const { data: existingLike } = await supabase
          .from("profile_likes")
          .select("id")
          .eq("liker_id", user.id)
          .eq("liked_profile_id", params.id as string)
          .single()

        if (existingLike) {
          setIsLiked(true)
        }
      }

      const { data } = await supabase.from("profiles").select("*").eq("id", params.id).single()
      if (data) {
        setProfile(data)
        // Increment profile views
        if (user) {
          await supabase.from("profile_views").insert({
            profile_id: params.id as string,
            viewer_id: user.id,
          })
        } else {
          await supabase.from("profile_views").insert({
            profile_id: params.id as string,
          })
        }
      }
      setLoading(false)
    }
    fetchProfile()
  }, [supabase, params.id])

  const handleSendInterest = async () => {
    if (!currentUser) {
      toast({
        title: "Login required",
        description: "Please login to send interest requests",
        variant: "destructive",
      })
      return
    }

    if (currentUser.gender === profile?.gender) {
      toast({
        title: "Cannot send interest",
        description: "You can only send interest to opposite gender profiles",
        variant: "destructive",
      })
      return
    }

    setSendingInterest(true)
    try {
      const { error } = await supabase.from("interest_requests").insert({
        sender_id: currentUser.id,
        receiver_id: params.id as string,
        status: "pending",
      })

      if (error) throw error

      setInterestStatus("pending")
      toast({
        title: "Interest sent!",
        description: "Your interest request has been sent successfully",
      })
    } catch (error: any) {
      console.error("[v0] Error sending interest:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to send interest request",
        variant: "destructive",
      })
    } finally {
      setSendingInterest(false)
    }
  }

  const handleLike = async () => {
    if (!currentUser) {
      toast({
        title: "Login required",
        description: "Please login to like profiles",
        variant: "destructive",
      })
      return
    }

    if (isLiked) {
      // Unlike
      const { error } = await supabase
        .from("profile_likes")
        .delete()
        .eq("liker_id", currentUser.id)
        .eq("liked_profile_id", params.id as string)

      if (!error) {
        setIsLiked(false)
        toast({
          title: "Profile unliked",
        })
      }
    } else {
      // Like
      const { error } = await supabase.from("profile_likes").insert({
        liker_id: currentUser.id,
        liked_profile_id: params.id as string,
      })

      if (!error) {
        setIsLiked(true)
        toast({
          title: "Profile liked!",
        })
      }
    }
  }

  const maskPhone = (phone: string) => {
    if (!phone) return ""
    return phone.slice(0, 3) + "****" + phone.slice(-2)
  }

  const maskEmail = (email: string) => {
    if (!email) return ""
    const [name, domain] = email.split("@")
    return name.slice(0, 2) + "****@" + domain
  }

  const canViewPhone = () => {
    if (currentUser?.id === profile?.id) return true
    if (profile?.phone_visibility === "all_users") return true
    if (profile?.phone_visibility === "friends") {
      // TODO: Check if users are friends
      return false
    }
    return false
  }

  const canViewEmail = () => {
    if (currentUser?.id === profile?.id) return true
    if (profile?.email_visibility === "all_users") return true
    if (profile?.email_visibility === "friends") {
      // TODO: Check if users are friends
      return false
    }
    return false
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Profile not found</p>
      </div>
    )
  }

  const age = profile.date_of_birth ? new Date().getFullYear() - new Date(profile.date_of_birth).getFullYear() : null
  const isOwnProfile = currentUser?.id === profile.id

  return (
    <div className="flex min-h-screen flex-col">
      <Header onSignUpClick={() => {}} onLoginClick={() => {}} />

      <main className="flex-1 bg-secondary/30 py-8">
        <div className="container mx-auto max-w-5xl px-4">
          {/* Profile Header */}
          <Card className="mb-6 overflow-hidden">
            <div
              className="relative h-48"
              style={{
                backgroundImage: `url(${profile.cover_photo || "/default-cover.png"})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <CardContent className="relative px-6 pb-6">
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-end">
                <Avatar className="h-40 w-40 -mt-20 border-4 border-card">
                  <AvatarImage src={profile.profile_photo || "/placeholder.svg"} />
                  <AvatarFallback className="bg-primary text-5xl text-primary-foreground">
                    {profile.first_name?.[0]}
                    {profile.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 text-center sm:text-left">
                  <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-center">
                    <h1 className="font-serif text-3xl font-bold">
                      {profile.first_name} {profile.last_name}
                    </h1>
                    {profile.is_verified && <Badge className="bg-blue-100 text-blue-700">Verified</Badge>}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground sm:justify-start">
                    {age && <span>{age} years</span>}
                    {profile.living_in && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {profile.living_in}
                      </span>
                    )}
                    {profile.profession && (
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        {profile.profession}
                      </span>
                    )}
                  </div>
                </div>

                {!isOwnProfile && (
                  <div className="flex gap-2">
                    {interestStatus === "pending" ? (
                      <Button disabled className="bg-muted">
                        Interest Sent
                      </Button>
                    ) : interestStatus === "accepted" ? (
                      <Button disabled className="bg-green-100 text-green-700">
                        Interest Accepted
                      </Button>
                    ) : (
                      <Button onClick={handleSendInterest} disabled={sendingInterest}>
                        {sendingInterest ? "Sending..." : "Send Interest"}
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="outline"
                      className={isLiked ? "text-red-500" : ""}
                      onClick={handleLike}
                    >
                      <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
                    </Button>
                    <Button size="icon" variant="outline">
                      <MessageSquare className="h-5 w-5" />
                    </Button>
                    <Button size="icon" variant="outline">
                      <Share2 className="h-5 w-5" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="space-y-6 lg:col-span-2">
              {/* About Me */}
              {profile.about_me && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="mb-4 font-serif text-xl font-semibold">About me</h2>
                    <p className="leading-relaxed text-muted-foreground">{profile.about_me}</p>
                  </CardContent>
                </Card>
              )}

              {/* Photo Gallery */}
              {profile.photo_gallery && profile.photo_gallery.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="mb-4 font-serif text-xl font-semibold">My Photo Gallery</h2>
                    <div className="grid grid-cols-3 gap-4">
                      {profile.photo_gallery.map((photo, index) => (
                        <div key={index} className="aspect-square overflow-hidden rounded-lg">
                          <img
                            src={photo || "/placeholder.svg"}
                            alt={`Gallery ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Hobbies */}
              {profile.hobbies && profile.hobbies.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="mb-4 font-serif text-xl font-semibold">Hobbies</h2>
                    <div className="flex flex-wrap gap-2">
                      {profile.hobbies.map((hobby, index) => (
                        <Badge key={index} variant="secondary" className="bg-accent/50">
                          {hobby}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Social Media */}
              {(profile.facebook_url || profile.twitter_url || profile.instagram_url || profile.linkedin_url) && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="mb-4 font-serif text-xl font-semibold">Social Media</h2>
                    <div className="flex gap-3">
                      {profile.facebook_url && (
                        <Button size="icon" variant="outline" asChild>
                          <a href={profile.facebook_url} target="_blank" rel="noopener noreferrer">
                            <Facebook className="h-5 w-5" />
                          </a>
                        </Button>
                      )}
                      {profile.twitter_url && (
                        <Button size="icon" variant="outline" asChild>
                          <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer">
                            <Twitter className="h-5 w-5" />
                          </a>
                        </Button>
                      )}
                      {profile.instagram_url && (
                        <Button size="icon" variant="outline" asChild>
                          <a href={profile.instagram_url} target="_blank" rel="noopener noreferrer">
                            <Instagram className="h-5 w-5" />
                          </a>
                        </Button>
                      )}
                      {profile.linkedin_url && (
                        <Button size="icon" variant="outline" asChild>
                          <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">
                            <Linkedin className="h-5 w-5" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Personal Information */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="mb-4 font-serif text-xl font-semibold">Personal Information</h2>
                  <dl className="space-y-3 text-sm">
                    <div>
                      <dt className="font-medium text-muted-foreground">Name:</dt>
                      <dd className="font-medium">
                        {profile.first_name} {profile.last_name}
                      </dd>
                    </div>
                    {profile.father_name && (
                      <div>
                        <dt className="font-medium text-muted-foreground">Father name:</dt>
                        <dd className="font-medium">{profile.father_name}</dd>
                      </div>
                    )}
                    {age && (
                      <div>
                        <dt className="font-medium text-muted-foreground">Age:</dt>
                        <dd className="font-medium">{age}</dd>
                      </div>
                    )}
                    {profile.date_of_birth && (
                      <div>
                        <dt className="font-medium text-muted-foreground">Date of birth:</dt>
                        <dd className="font-medium">{new Date(profile.date_of_birth).toLocaleDateString()}</dd>
                      </div>
                    )}
                    {profile.height && (
                      <div>
                        <dt className="font-medium text-muted-foreground">Height:</dt>
                        <dd className="font-medium">{profile.height}</dd>
                      </div>
                    )}
                    {profile.weight && (
                      <div>
                        <dt className="font-medium text-muted-foreground">Weight:</dt>
                        <dd className="font-medium">{profile.weight}</dd>
                      </div>
                    )}
                    {profile.religion && (
                      <div>
                        <dt className="font-medium text-muted-foreground">Religion:</dt>
                        <dd className="font-medium">{profile.religion}</dd>
                      </div>
                    )}
                    {profile.community && (
                      <div>
                        <dt className="font-medium text-muted-foreground">Community:</dt>
                        <dd className="font-medium">{profile.community}</dd>
                      </div>
                    )}
                    {profile.phone && (
                      <div>
                        <dt className="font-medium text-muted-foreground">Phone:</dt>
                        <dd className="font-medium">{canViewPhone() ? profile.phone : maskPhone(profile.phone)}</dd>
                      </div>
                    )}
                    {profile.email && (
                      <div>
                        <dt className="font-medium text-muted-foreground">Email:</dt>
                        <dd className="font-medium">{canViewEmail() ? profile.email : maskEmail(profile.email)}</dd>
                      </div>
                    )}
                  </dl>
                </CardContent>
              </Card>

              {/* Professional Information */}
              {(profile.education || profile.profession || profile.company) && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="mb-4 font-serif text-xl font-semibold">Professional</h2>
                    <dl className="space-y-3 text-sm">
                      {profile.education && (
                        <div>
                          <dt className="font-medium text-muted-foreground">Degree:</dt>
                          <dd className="font-medium">{profile.education}</dd>
                        </div>
                      )}
                      {profile.profession && (
                        <div>
                          <dt className="font-medium text-muted-foreground">Profession:</dt>
                          <dd className="font-medium">{profile.profession}</dd>
                        </div>
                      )}
                      {profile.company && (
                        <div>
                          <dt className="font-medium text-muted-foreground">Company:</dt>
                          <dd className="font-medium">{profile.company}</dd>
                        </div>
                      )}
                      {profile.annual_income && (
                        <div>
                          <dt className="font-medium text-muted-foreground">Salary:</dt>
                          <dd className="font-medium">{profile.annual_income}</dd>
                        </div>
                      )}
                    </dl>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
