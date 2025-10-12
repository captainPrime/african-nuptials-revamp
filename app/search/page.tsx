"use client"

import { useEffect, useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { Profile } from "@/lib/types/profile"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Heart, Grid3x3, List } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { getCompatibleMatches } from "@/lib/utils/matching-algorithm"

export default function SearchPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [currentUser, setCurrentUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [likedProfiles, setLikedProfiles] = useState<Set<string>>(new Set())
  const [existingRequests, setExistingRequests] = useState<Set<string>>(new Set())
  const [friendships, setFriendships] = useState<Set<string>>(new Set())
  const [matchScores, setMatchScores] = useState<Map<string, number>>(new Map())
  const supabase = getSupabaseBrowserClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [filters, setFilters] = useState({
    gender: "",
    ageMin: "",
    ageMax: "",
    religion: "",
    location: "",
    availability: "all",
    profileType: "all",
    education: "",
    maritalStatus: "",
  })

  useEffect(() => {
    const gender = searchParams.get("gender") || ""
    const ageMin = searchParams.get("ageMin") || ""
    const ageMax = searchParams.get("ageMax") || ""
    const religion = searchParams.get("religion") || ""
    const location = searchParams.get("location") || ""

    setFilters((prev) => ({
      ...prev,
      gender,
      ageMin,
      ageMax,
      religion,
      location,
    }))
  }, [searchParams])

  useEffect(() => {
    const fetchProfiles = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
        if (profile) {
          setCurrentUser(profile)

          if (!filters.gender) {
            const oppositeGender = profile.gender === "male" ? "female" : "male"
            setFilters((prev) => ({ ...prev, gender: oppositeGender }))
          }

          const { data: likes } = await supabase
            .from("profile_likes")
            .select("liked_profile_id")
            .eq("liker_id", user.id)

          if (likes) {
            setLikedProfiles(new Set(likes.map((like) => like.liked_profile_id)))
          }

          const { data: allRequests } = await supabase
            .from("interest_requests")
            .select("sender_id, receiver_id, status")
            .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)

          if (allRequests) {
            const requestSet = new Set<string>()
            const friendSet = new Set<string>()

            allRequests.forEach((req) => {
              const otherId = req.sender_id === user.id ? req.receiver_id : req.sender_id
              requestSet.add(otherId)

              if (req.status === "accepted") {
                friendSet.add(otherId)
              }
            })

            setExistingRequests(requestSet)
            setFriendships(friendSet)
          }
        }
      }

      let query = supabase.from("profiles").select("*").order("created_at", { ascending: false })

      if (user) {
        query = query.neq("id", user.id)
      }

      if (filters.gender) {
        query = query.eq("gender", filters.gender)
      }

      if (filters.religion) {
        query = query.eq("religion", filters.religion)
      }

      if (filters.location) {
        query = query.ilike("living_in", `%${filters.location}%`)
      }

      if (filters.education) {
        query = query.eq("education", filters.education)
      }

      if (filters.maritalStatus) {
        query = query.eq("marital_status", filters.maritalStatus)
      }

      if (filters.profileType === "premium") {
        query = query.neq("membership_plan", "free")
      }

      const { data } = await query

      let filteredData = data || []
      if (filters.ageMin || filters.ageMax) {
        filteredData = filteredData.filter((profile) => {
          if (!profile.date_of_birth) return false
          const age = new Date().getFullYear() - new Date(profile.date_of_birth).getFullYear()
          const min = filters.ageMin ? Number.parseInt(filters.ageMin) : 0
          const max = filters.ageMax ? Number.parseInt(filters.ageMax) : 999
          return age >= min && age <= max
        })
      }

      setProfiles(filteredData)

      if (user && filteredData.length > 0) {
        const matches = await getCompatibleMatches(user.id, filteredData.length)
        const scoresMap = new Map<string, number>()
        matches.forEach((match) => {
          scoresMap.set(match.profile.id, match.compatibility_score)
        })
        setMatchScores(scoresMap)
      }

      setLoading(false)
    }

    fetchProfiles()
  }, [supabase, filters])

  const handleLike = async (profileId: string) => {
    if (!currentUser) {
      toast({
        title: "Login required",
        description: "Please login to like profiles",
        variant: "destructive",
      })
      return
    }

    const isLiked = likedProfiles.has(profileId)

    if (isLiked) {
      const { error } = await supabase
        .from("profile_likes")
        .delete()
        .eq("liker_id", currentUser.id)
        .eq("liked_profile_id", profileId)

      if (!error) {
        setLikedProfiles((prev) => {
          const newSet = new Set(prev)
          newSet.delete(profileId)
          return newSet
        })
        toast({
          title: "Profile unliked",
        })
      }
    } else {
      const { error } = await supabase.from("profile_likes").insert({
        liker_id: currentUser.id,
        liked_profile_id: profileId,
      })

      if (!error) {
        setLikedProfiles((prev) => new Set(prev).add(profileId))
        toast({
          title: "Profile liked!",
        })
      }
    }
  }

  const handleSendInterest = async (profileId: string, profileGender: string) => {
    if (!currentUser) {
      toast({
        title: "Login required",
        description: "Please login to send interest requests",
        variant: "destructive",
      })
      return
    }

    if (currentUser.gender === profileGender) {
      toast({
        title: "Cannot send interest",
        description: "You can only send interest to opposite gender profiles",
        variant: "destructive",
      })
      return
    }

    if (existingRequests.has(profileId)) {
      toast({
        title: "Request already exists",
        description: "You have already sent or received an interest request from this profile",
        variant: "destructive",
      })
      return
    }

    const { error } = await supabase.from("interest_requests").insert({
      sender_id: currentUser.id,
      receiver_id: profileId,
      status: "pending",
    })

    if (error) {
      if (error.code === "23505") {
        toast({
          title: "Already sent",
          description: "You have already sent an interest request to this profile",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to send interest request",
          variant: "destructive",
        })
      }
    } else {
      setExistingRequests((prev) => new Set(prev).add(profileId))
      toast({
        title: "Interest sent!",
        description: "Your interest request has been sent successfully",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header onSignUpClick={() => {}} onLoginClick={() => {}} />

      <main className="flex-1 bg-secondary/30 py-8">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 lg:grid-cols-4">
            <Card className="h-fit lg:col-span-1">
              <CardContent className="space-y-6 p-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />I am looking for
                  </Label>
                  <Select value={filters.gender} onValueChange={(value) => setFilters({ ...filters, gender: value })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="I'm looking for" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="female">Woman</SelectItem>
                      <SelectItem value="male">Man</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Age Range</Label>
                  <div className="flex gap-2">
                    <Select value={filters.ageMin} onValueChange={(value) => setFilters({ ...filters, ageMin: value })}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Min" />
                      </SelectTrigger>
                      <SelectContent>
                        {[18, 21, 25, 30, 35, 40, 45, 50].map((age) => (
                          <SelectItem key={age} value={age.toString()}>
                            {age}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={filters.ageMax} onValueChange={(value) => setFilters({ ...filters, ageMax: value })}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Max" />
                      </SelectTrigger>
                      <SelectContent>
                        {[25, 30, 35, 40, 45, 50, 55, 60].map((age) => (
                          <SelectItem key={age} value={age.toString()}>
                            {age}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Select Religion</Label>
                  <Select
                    value={filters.religion}
                    onValueChange={(value) => setFilters({ ...filters, religion: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Religion" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Christianity">Christianity</SelectItem>
                      <SelectItem value="Islam">Islam</SelectItem>
                      <SelectItem value="Traditional">Traditional</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Location</Label>
                  <Select
                    value={filters.location}
                    onValueChange={(value) => setFilters({ ...filters, location: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Lagos">Lagos, Nigeria</SelectItem>
                      <SelectItem value="Accra">Accra, Ghana</SelectItem>
                      <SelectItem value="Nairobi">Nairobi, Kenya</SelectItem>
                      <SelectItem value="Johannesburg">Johannesburg, South Africa</SelectItem>
                      <SelectItem value="Cairo">Cairo, Egypt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Education</Label>
                  <Select
                    value={filters.education}
                    onValueChange={(value) => setFilters({ ...filters, education: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select education" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High School">High School</SelectItem>
                      <SelectItem value="Associate Degree">Associate Degree</SelectItem>
                      <SelectItem value="Bachelor's Degree">Bachelor's Degree</SelectItem>
                      <SelectItem value="Master's Degree">Master's Degree</SelectItem>
                      <SelectItem value="Doctorate">Doctorate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Marital Status</Label>
                  <Select
                    value={filters.maritalStatus}
                    onValueChange={(value) => setFilters({ ...filters, maritalStatus: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Single">Single</SelectItem>
                      <SelectItem value="Divorced">Divorced</SelectItem>
                      <SelectItem value="Widowed">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Availability</Label>
                  <RadioGroup
                    value={filters.availability}
                    onValueChange={(value) => setFilters({ ...filters, availability: value })}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="all" id="all" />
                      <Label htmlFor="all" className="font-normal">
                        All
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="available" id="available" />
                      <Label htmlFor="available" className="font-normal">
                        Available
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="offline" id="offline" />
                      <Label htmlFor="offline" className="font-normal">
                        Offline
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Profile</Label>
                  <RadioGroup
                    value={filters.profileType}
                    onValueChange={(value) => setFilters({ ...filters, profileType: value })}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="all" id="profile-all" />
                      <Label htmlFor="profile-all" className="font-normal">
                        All
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="premium" id="premium" />
                      <Label htmlFor="premium" className="font-normal">
                        Premium
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() =>
                    setFilters({
                      gender: "",
                      ageMin: "",
                      ageMax: "",
                      religion: "",
                      location: "",
                      availability: "all",
                      profileType: "all",
                      education: "",
                      maritalStatus: "",
                    })
                  }
                >
                  Reset Filters
                </Button>
              </CardContent>
            </Card>

            <div className="lg:col-span-3">
              <div className="mb-6 flex items-center justify-between">
                <h1 className="font-serif text-2xl font-semibold">Showing {profiles.length} profiles</h1>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Sort by:</Label>
                    <Select defaultValue="relevant">
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevant">Most relative</SelectItem>
                        <SelectItem value="recent">Most recent</SelectItem>
                        <SelectItem value="popular">Most popular</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant={viewMode === "grid" ? "default" : "outline"}
                      onClick={() => setViewMode("grid")}
                    >
                      <Grid3x3 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant={viewMode === "list" ? "default" : "outline"}
                      onClick={() => setViewMode("list")}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {viewMode === "grid" ? (
                <div className="grid gap-6 sm:grid-cols-2">
                  {profiles.map((profile) => {
                    const age = profile.date_of_birth
                      ? new Date().getFullYear() - new Date(profile.date_of_birth).getFullYear()
                      : null
                    const isLiked = likedProfiles.has(profile.id)
                    const isFriend = friendships.has(profile.id)
                    const isSameGender = currentUser?.gender === profile.gender
                    const matchPercentage = matchScores.get(profile.id)
                    const canSendInterest = profile.who_can_send_interest !== "none"

                    return (
                      <Card key={profile.id} className="overflow-hidden">
                        <div className="relative">
                          <div className="relative aspect-[4/3]">
                            <img
                              src={profile.profile_photo || "/placeholder.svg"}
                              alt={profile.first_name}
                              className="h-full w-full object-cover"
                            />
                            <div className="absolute left-3 top-3 flex gap-2">
                              <div className="h-3 w-3 rounded-full border-2 border-white bg-green-500" />
                              {matchPercentage !== undefined && (
                                <Badge className="bg-[#52343c] text-white font-semibold">
                                  {Math.round(matchPercentage)}% Match
                                </Badge>
                              )}
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              className={`absolute right-3 top-3 bg-white/80 hover:bg-white ${isLiked ? "text-red-500" : ""}`}
                              onClick={() => handleLike(profile.id)}
                            >
                              <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
                            </Button>
                            {profile.membership_plan !== "free" && (
                              <div className="absolute bottom-0 left-0 right-0 bg-green-500 py-1 text-center text-xs font-medium text-white">
                                Available Online
                              </div>
                            )}
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="mb-2 font-serif text-xl font-semibold">
                            {profile.first_name} {profile.last_name}
                          </h3>
                          <div className="mb-3 flex flex-wrap gap-2">
                            {isFriend && (
                              <Badge variant="secondary" className="bg-green-500 text-white">
                                Friend
                              </Badge>
                            )}
                            {profile.education && (
                              <Badge variant="secondary" className="bg-primary text-primary-foreground">
                                {profile.education}
                              </Badge>
                            )}
                            {profile.profession && (
                              <Badge variant="secondary" className="bg-primary text-primary-foreground">
                                {profile.profession}
                              </Badge>
                            )}
                            {age && (
                              <Badge variant="secondary" className="bg-primary text-primary-foreground">
                                {age} Years old
                              </Badge>
                            )}
                            {profile.height && (
                              <Badge variant="secondary" className="bg-primary text-primary-foreground">
                                Height: {profile.height}
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {!isSameGender && (
                              <>
                                {isFriend ? (
                                  <Button size="sm" onClick={() => router.push(`/dashboard/chat?userId=${profile.id}`)}>
                                    Chat now
                                  </Button>
                                ) : !canSendInterest ? (
                                  <Button size="sm" variant="outline" disabled>
                                    User is Private
                                  </Button>
                                ) : !existingRequests.has(profile.id) ? (
                                  <Button size="sm" onClick={() => handleSendInterest(profile.id, profile.gender)}>
                                    Send interest
                                  </Button>
                                ) : (
                                  <Button size="sm" variant="outline" disabled>
                                    Request Sent
                                  </Button>
                                )}
                              </>
                            )}
                            <Button size="sm" variant="outline" onClick={() => router.push(`/profile/${profile.id}`)}>
                              More details
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              ) : (
                <div className="space-y-4">
                  {profiles.map((profile) => {
                    const age = profile.date_of_birth
                      ? new Date().getFullYear() - new Date(profile.date_of_birth).getFullYear()
                      : null
                    const isLiked = likedProfiles.has(profile.id)
                    const isFriend = friendships.has(profile.id)
                    const isSameGender = currentUser?.gender === profile.gender
                    const matchPercentage = matchScores.get(profile.id)
                    const canSendInterest = profile.who_can_send_interest !== "none"

                    return (
                      <Card key={profile.id} className="overflow-hidden">
                        <CardContent className="flex gap-4 p-4">
                          <div className="relative h-48 w-48 flex-shrink-0">
                            <img
                              src={profile.profile_photo || "/placeholder.svg"}
                              alt={profile.first_name}
                              className="h-full w-full rounded-lg object-cover"
                            />
                            <div className="absolute left-3 top-3 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
                            {matchPercentage !== undefined && (
                              <Badge className="absolute left-3 top-8 bg-[#52343c] text-white font-semibold">
                                {Math.round(matchPercentage)}% Match
                              </Badge>
                            )}
                            {profile.membership_plan !== "free" && (
                              <div className="absolute bottom-0 left-0 right-0 rounded-b-lg bg-green-500 py-1 text-center text-xs font-medium text-white">
                                Available Online
                              </div>
                            )}
                          </div>
                          <div className="flex flex-1 flex-col">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="mb-2 font-serif text-xl font-semibold">
                                  {profile.first_name} {profile.last_name}
                                </h3>
                                <div className="mb-3 flex flex-wrap gap-2">
                                  {isFriend && (
                                    <Badge variant="secondary" className="bg-green-500 text-white">
                                      Friend
                                    </Badge>
                                  )}
                                  {profile.education && (
                                    <Badge variant="secondary" className="bg-primary text-primary-foreground">
                                      {profile.education}
                                    </Badge>
                                  )}
                                  {profile.profession && (
                                    <Badge variant="secondary" className="bg-primary text-primary-foreground">
                                      {profile.profession}
                                    </Badge>
                                  )}
                                  {age && (
                                    <Badge variant="secondary" className="bg-primary text-primary-foreground">
                                      {age} Years old
                                    </Badge>
                                  )}
                                  {profile.height && (
                                    <Badge variant="secondary" className="bg-primary text-primary-foreground">
                                      Height: {profile.height}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <Button
                                size="icon"
                                variant="ghost"
                                className={isLiked ? "text-red-500" : ""}
                                onClick={() => handleLike(profile.id)}
                              >
                                <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
                              </Button>
                            </div>
                            <div className="mt-auto flex flex-wrap gap-2">
                              {!isSameGender && (
                                <>
                                  {isFriend ? (
                                    <Button
                                      size="sm"
                                      onClick={() => router.push(`/dashboard/chat?userId=${profile.id}`)}
                                    >
                                      Chat now
                                    </Button>
                                  ) : !canSendInterest ? (
                                    <Button size="sm" variant="outline" disabled>
                                      User is Private
                                    </Button>
                                  ) : !existingRequests.has(profile.id) ? (
                                    <Button size="sm" onClick={() => handleSendInterest(profile.id, profile.gender)}>
                                      Send interest
                                    </Button>
                                  ) : (
                                    <Button size="sm" variant="outline" disabled>
                                      Request Sent
                                    </Button>
                                  )}
                                </>
                              )}
                              <Button size="sm" variant="outline" onClick={() => router.push(`/profile/${profile.id}`)}>
                                More details
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
