"use client"

import { useEffect, useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { Profile } from "@/lib/types/profile"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Heart, MessageSquare, Share2, Facebook, Twitter, Instagram, Linkedin, MapPin, Briefcase } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useParams, useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { shareProfile, getOrCreateConversation } from "@/lib/utils/chat"

export default function PublicProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [currentUser, setCurrentUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [sendingInterest, setSendingInterest] = useState(false)
  const [interestStatus, setInterestStatus] = useState<string | null>(null)
  const [isLiked, setIsLiked] = useState(false)
  const [isFriend, setIsFriend] = useState(false)
  const [isProfilePrivate, setIsProfilePrivate] = useState(false)
  const supabase = getSupabaseBrowserClient()
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", params.id).single()

      if (profileData) {
        setProfile(profileData)
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: currentUserProfile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
        if (currentUserProfile) setCurrentUser(currentUserProfile)

        console.log("[v0] Checking friendship between", user.id, "and", params.id)

        const { data: existingRequest, error: requestError } = await supabase
          .from("interest_requests")
          .select("status")
          .or(
            `and(sender_id.eq.${user.id},receiver_id.eq.${params.id}),and(sender_id.eq.${params.id},receiver_id.eq.${user.id})`,
          )
          .eq("status", "accepted")
          .maybeSingle()

        console.log("[v0] Friendship check result:", existingRequest, requestError)

        if (existingRequest && existingRequest.status === "accepted") {
          console.log("[v0] Users are friends!")
          setIsFriend(true)
        }

        if (profileData && user.id !== profileData.id) {
          if (profileData.profile_visibility === "friends" && !existingRequest) {
            setIsProfilePrivate(true)
          }
        }

        const { data: anyRequest } = await supabase
          .from("interest_requests")
          .select("status")
          .or(
            `and(sender_id.eq.${user.id},receiver_id.eq.${params.id}),and(sender_id.eq.${params.id},receiver_id.eq.${user.id})`,
          )
          .maybeSingle()

        if (anyRequest) {
          setInterestStatus(anyRequest.status)
        }

        const { data: existingLike } = await supabase
          .from("profile_likes")
          .select("id")
          .eq("liker_id", user.id)
          .eq("liked_profile_id", params.id as string)
          .maybeSingle()

        if (existingLike) {
          setIsLiked(true)
        }

        if (user.id !== params.id) {
          await supabase.from("profile_views").insert({
            profile_id: params.id as string,
            viewer_id: user.id,
          })

          const { count } = await supabase
            .from("profile_views")
            .select("*", { count: "exact", head: true })
            .eq("profile_id", params.id as string)

          if (count !== null) {
            await supabase
              .from("profiles")
              .update({ profile_views: count })
              .eq("id", params.id as string)
          }
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

    if (!profile) return

    if (currentUser.gender === profile.gender) {
      toast({
        title: "Cannot send interest",
        description: "You can only send interest to opposite gender profiles",
        variant: "destructive",
      })
      return
    }

    setSendingInterest(true)
    try {
      const { data: existing } = await supabase
        .from("interest_requests")
        .select("id, status")
        .or(
          `and(sender_id.eq.${currentUser.id},receiver_id.eq.${params.id}),and(sender_id.eq.${params.id},receiver_id.eq.${currentUser.id})`,
        )
        .maybeSingle()

      if (existing) {
        toast({
          title: "Request already exists",
          description: "An interest request already exists between you and this user",
          variant: "destructive",
        })
        setSendingInterest(false)
        return
      }

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

  const handleShare = async () => {
    if (!profile) return

    const result = await shareProfile(profile.id, `${profile.first_name} ${profile.last_name}`)

    if (result.success) {
      toast({
        title: result.fallback ? "Link copied!" : "Shared successfully!",
        description: result.fallback ? "Profile link copied to clipboard" : "Profile shared successfully",
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to share profile",
        variant: "destructive",
      })
    }
  }

  const handleMessage = async () => {
    if (!currentUser) {
      toast({
        title: "Login required",
        description: "Please login to send messages",
        variant: "destructive",
      })
      return
    }

    if (!isFriend) {
      toast({
        title: "Not friends",
        description: "You can only message users who have accepted your friend request",
        variant: "destructive",
      })
      return
    }

    const conversationId = await getOrCreateConversation(currentUser.id, params.id as string)
    if (conversationId) {
      router.push(`/dashboard/chat?conversationId=${conversationId}`)
    } else {
      toast({
        title: "Error",
        description: "Failed to create conversation",
        variant: "destructive",
      })
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
    if (!profile) return false
    if (currentUser?.id === profile.id) return true
    if (profile.phone_visibility === "all_users") return true
    if (profile.phone_visibility === "friends") {
      return false
    }
    return false
  }

  const canViewEmail = () => {
    if (!profile) return false
    if (currentUser?.id === profile.id) return true
    if (profile.email_visibility === "all_users") return true
    if (profile.email_visibility === "friends") {
      return false
    }
    return false
  }

  const age = profile?.date_of_birth ? new Date().getFullYear() - new Date(profile.date_of_birth).getFullYear() : null
  const isOwnProfile = currentUser?.id === profile?.id
  const isSameGender = currentUser?.gender === profile?.gender
  const canSendInterest = profile?.who_can_send_interest !== "none"

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header onSignUpClick={() => {}} onLoginClick={() => {}} />
        <main className="flex-1 bg-secondary/30 py-8">
          <div className="container mx-auto max-w-5xl px-4">
            <Card className="mb-6 overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardContent className="relative px-6 pb-6">
                <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-end">
                  <Skeleton className="h-40 w-40 -mt-20 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <Card>
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-32 mb-4" />
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-48 mb-4" />
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header onSignUpClick={() => {}} onLoginClick={() => {}} />
        <main className="flex-1 bg-secondary/30 py-8">
          <div className="container mx-auto max-w-5xl px-4">
            <Card className="p-12 text-center">
              <h2 className="text-2xl font-semibold mb-2">Profile not found</h2>
              <p className="text-muted-foreground">The profile you're looking for doesn't exist.</p>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (isProfilePrivate && !isOwnProfile) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header onSignUpClick={() => {}} onLoginClick={() => {}} />
        <main className="flex-1 bg-secondary/30 py-8">
          <div className="container mx-auto max-w-5xl px-4">
            <Card className="p-12 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-10 w-10 text-muted-foreground"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold mb-2">This Account is Private</h2>
              <p className="text-muted-foreground mb-6">
                This user has set their profile to be visible to friends only. Send them a friend request to view their
                profile.
              </p>
              <Button onClick={() => router.push("/search")}>Back to Search</Button>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header onSignUpClick={() => {}} onLoginClick={() => {}} />

      <main className="flex-1 bg-secondary/30 py-8">
        <div className="container mx-auto max-w-5xl px-4">
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
                    {isFriend && <Badge className="bg-green-100 text-green-700 border border-green-300">Friend</Badge>}
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
                    {!isSameGender && !isFriend && (
                      <>
                        {!canSendInterest ? (
                          <Button disabled variant="outline">
                            User is Private
                          </Button>
                        ) : interestStatus === "pending" ? (
                          <Button disabled className="bg-muted">
                            Interest Sent
                          </Button>
                        ) : (
                          <Button onClick={handleSendInterest} disabled={sendingInterest}>
                            {sendingInterest ? "Sending..." : "Send Interest"}
                          </Button>
                        )}
                      </>
                    )}
                    <Button
                      size="icon"
                      variant="outline"
                      className={isLiked ? "text-red-500" : ""}
                      onClick={handleLike}
                    >
                      <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
                    </Button>
                    {isFriend && (
                      <Button size="icon" variant="outline" onClick={handleMessage}>
                        <MessageSquare className="h-5 w-5" />
                      </Button>
                    )}
                    <Button size="icon" variant="outline" onClick={handleShare}>
                      <Share2 className="h-5 w-5" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              {profile.about_me && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="mb-4 font-serif text-xl font-semibold">About me</h2>
                    <p className="leading-relaxed text-muted-foreground">{profile.about_me}</p>
                  </CardContent>
                </Card>
              )}

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

            <div className="space-y-6">
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
