"use client"

import { useEffect, useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { Profile } from "@/lib/types/profile"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Heart, Search, ChevronLeft, ChevronRight, MapPin, Briefcase, Ruler, Award } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface InterestRequest {
  id: string
  sender: Profile
  status: string
  created_at: string
}

export default function DashboardPage() {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null)
  const [newMatches, setNewMatches] = useState<Profile[]>([])
  const [interestRequests, setInterestRequests] = useState<InterestRequest[]>([])
  const [sentRequests, setSentRequests] = useState<InterestRequest[]>([])
  const [likesCount, setLikesCount] = useState(0)
  const [interestsCount, setInterestsCount] = useState(0)
  const [recentChats, setRecentChats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0)
  const supabase = getSupabaseBrowserClient()
  const router = useRouter()
  const { toast } = useToast()

  const [searchFilters, setSearchFilters] = useState({
    gender: "",
    ageMin: "",
    ageMax: "",
    religion: "",
    location: "",
  })

  useEffect(() => {
    const fetchDashboardData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/")
        return
      }

      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      if (profile) setCurrentUser(profile)

      const { data: matches } = await supabase
        .from("profiles")
        .select("*")
        .neq("id", user.id)
        .neq("gender", profile?.gender || "")
        .order("created_at", { ascending: false })
        .limit(10)

      if (matches) setNewMatches(matches)

      const { data: requests } = await supabase
        .from("interest_requests")
        .select("*, sender:sender_id(*)")
        .eq("receiver_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10)

      if (requests) {
        setInterestRequests(
          requests.map((req: any) => ({
            id: req.id,
            sender: req.sender,
            status: req.status,
            created_at: req.created_at,
          })),
        )
      }

      const { data: sent } = await supabase
        .from("interest_requests")
        .select("*, receiver:receiver_id(*)")
        .eq("sender_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10)

      if (sent) {
        setSentRequests(
          sent.map((req: any) => ({
            id: req.id,
            sender: req.receiver,
            status: req.status,
            created_at: req.created_at,
          })),
        )
      }

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

      const { data: conversations } = await supabase
        .from("conversations")
        .select(
          `
          *,
          participant1:profiles!conversations_participant1_id_fkey(*),
          participant2:profiles!conversations_participant2_id_fkey(*)
        `,
        )
        .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
        .order("last_message_at", { ascending: false })
        .limit(4)

      if (conversations) {
        const chatsWithOtherUser = conversations.map((conv: any) => {
          const otherUser = conv.participant1.id === user.id ? conv.participant2 : conv.participant1
          return {
            id: conv.id,
            other_user: otherUser,
            last_message: conv.last_message,
            last_message_at: conv.last_message_at,
          }
        })
        setRecentChats(chatsWithOtherUser)
      }

      setLoading(false)
    }

    fetchDashboardData()
  }, [supabase, router])

  const handleAcceptRequest = async (requestId: string) => {
    const { error } = await supabase.from("interest_requests").update({ status: "accepted" }).eq("id", requestId)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to accept request",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Request accepted!",
        description: "You have accepted the interest request",
      })
      const { data: requests } = await supabase
        .from("interest_requests")
        .select("*, sender:sender_id(*)")
        .eq("receiver_id", currentUser?.id)
        .order("created_at", { ascending: false })

      if (requests) {
        setInterestRequests(
          requests.map((req: any) => ({
            id: req.id,
            sender: req.sender,
            status: req.status,
            created_at: req.created_at,
          })),
        )
      }
    }
  }

  const handleDenyRequest = async (requestId: string) => {
    const { error } = await supabase.from("interest_requests").update({ status: "denied" }).eq("id", requestId)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to deny request",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Request denied",
        description: "You have denied the interest request",
      })
      const { data: requests } = await supabase
        .from("interest_requests")
        .select("*, sender:sender_id(*)")
        .eq("receiver_id", currentUser?.id)
        .order("created_at", { ascending: false })

      if (requests) {
        setInterestRequests(
          requests.map((req: any) => ({
            id: req.id,
            sender: req.sender,
            status: req.status,
            created_at: req.created_at,
          })),
        )
      }
    }
  }

  const nextMatch = () => {
    setCurrentMatchIndex((prev) => (prev + 1) % newMatches.length)
  }

  const prevMatch = () => {
    setCurrentMatchIndex((prev) => (prev - 1 + newMatches.length) % newMatches.length)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  const pendingRequests = interestRequests.filter((req) => req.status === "pending")
  const acceptedRequests = interestRequests.filter((req) => req.status === "accepted")
  const deniedRequests = interestRequests.filter((req) => req.status === "denied")
  const pendingSent = sentRequests.filter((req) => req.status === "pending")
  const acceptedSent = sentRequests.filter((req) => req.status === "accepted")
  const deniedSent = sentRequests.filter((req) => req.status === "denied")

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="advance" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="advance">Advance Search</TabsTrigger>
              <TabsTrigger value="profile-id">Profile ID Search</TabsTrigger>
            </TabsList>
            <TabsContent value="advance">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    I'm looking for
                  </Label>
                  <Select
                    value={searchFilters.gender}
                    onValueChange={(value) => setSearchFilters({ ...searchFilters, gender: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Woman" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="woman">Woman</SelectItem>
                      <SelectItem value="man">Man</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>aged</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="22"
                      className="w-20"
                      value={searchFilters.ageMin}
                      onChange={(e) => setSearchFilters({ ...searchFilters, ageMin: e.target.value })}
                    />
                    <span>to</span>
                    <Input
                      type="number"
                      placeholder="36"
                      className="w-20"
                      value={searchFilters.ageMax}
                      onChange={(e) => setSearchFilters({ ...searchFilters, ageMax: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>of religion</Label>
                  <Select
                    value={searchFilters.religion}
                    onValueChange={(value) => setSearchFilters({ ...searchFilters, religion: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Please select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="christianity">Christianity</SelectItem>
                      <SelectItem value="islam">Islam</SelectItem>
                      <SelectItem value="traditional">Traditional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>and living in</Label>
                  <Select
                    value={searchFilters.location}
                    onValueChange={(value) => setSearchFilters({ ...searchFilters, location: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Please select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lagos">Lagos, Nigeria</SelectItem>
                      <SelectItem value="accra">Accra, Ghana</SelectItem>
                      <SelectItem value="nairobi">Nairobi, Kenya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                className="mt-4"
                onClick={() => {
                  const params = new URLSearchParams()
                  if (searchFilters.gender) params.set("gender", searchFilters.gender)
                  if (searchFilters.ageMin) params.set("ageMin", searchFilters.ageMin)
                  if (searchFilters.ageMax) params.set("ageMax", searchFilters.ageMax)
                  if (searchFilters.religion) params.set("religion", searchFilters.religion)
                  if (searchFilters.location) params.set("location", searchFilters.location)
                  router.push(`/search?${params.toString()}`)
                }}
              >
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </TabsContent>
            <TabsContent value="profile-id">
              <div className="flex gap-4">
                <Input placeholder="Enter Profile ID" className="max-w-md" />
                <Button>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-serif text-xl font-semibold">New Profiles Matches</h2>
                <div className="flex gap-2">
                  <Button size="icon" variant="outline" onClick={prevMatch} disabled={newMatches.length === 0}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="outline" onClick={nextMatch} disabled={newMatches.length === 0}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {newMatches.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {newMatches.slice(currentMatchIndex, currentMatchIndex + 4).map((match) => {
                    const age = match.date_of_birth
                      ? new Date().getFullYear() - new Date(match.date_of_birth).getFullYear()
                      : null
                    return (
                      <Card
                        key={match.id}
                        className="group cursor-pointer overflow-hidden transition-shadow hover:shadow-lg"
                        onClick={() => router.push(`/profile/${match.id}`)}
                      >
                        <div className="relative aspect-[3/4]">
                          <img
                            src={match.profile_photo || "/placeholder.svg"}
                            alt={match.first_name}
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-white">
                            <p className="font-semibold">{match.first_name}</p>
                            <p className="text-xs">
                              {match.living_in} | {age} yrs old
                            </p>
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 font-serif text-xl font-semibold">Interest request</h2>
              <Tabs defaultValue="new" className="w-full">
                <TabsList>
                  <TabsTrigger value="new">New requests</TabsTrigger>
                  <TabsTrigger value="accepted">Accept request</TabsTrigger>
                  <TabsTrigger value="denied">Denied request</TabsTrigger>
                  <TabsTrigger value="sent">Sent requests</TabsTrigger>
                </TabsList>
                <TabsContent value="new" className="space-y-4">
                  {pendingRequests.length === 0 ? (
                    <p className="py-8 text-center text-muted-foreground">No new requests</p>
                  ) : (
                    pendingRequests.map((request) => {
                      const age = request.sender.date_of_birth
                        ? new Date().getFullYear() - new Date(request.sender.date_of_birth).getFullYear()
                        : null
                      return (
                        <Card key={request.id}>
                          <CardContent className="flex items-center gap-4 p-4">
                            <Avatar className="h-20 w-20">
                              <AvatarImage src={request.sender.profile_photo || "/placeholder.svg"} />
                              <AvatarFallback>
                                {request.sender.first_name?.[0]}
                                {request.sender.last_name?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h3 className="font-semibold">
                                {request.sender.first_name} {request.sender.last_name}
                              </h3>
                              <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                                {request.sender.living_in && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    City: {request.sender.living_in}
                                  </span>
                                )}
                                {age && <span>Age: {age}</span>}
                                {request.sender.height && (
                                  <span className="flex items-center gap-1">
                                    <Ruler className="h-3 w-3" />
                                    Height: {request.sender.height}
                                  </span>
                                )}
                                {request.sender.profession && (
                                  <span className="flex items-center gap-1">
                                    <Briefcase className="h-3 w-3" />
                                    Job: {request.sender.profession}
                                  </span>
                                )}
                              </div>
                              <div className="mt-2 flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => router.push(`/profile/${request.sender.id}`)}
                                >
                                  View full profile
                                </Button>
                              </div>
                              <p className="mt-2 text-xs text-muted-foreground">
                                Request on: {new Date(request.created_at).toLocaleDateString()} at{" "}
                                {new Date(request.created_at).toLocaleTimeString()}
                              </p>
                            </div>
                            <div className="flex flex-col gap-2">
                              <Button
                                size="sm"
                                className="bg-accent/50 text-primary hover:bg-accent"
                                onClick={() => handleAcceptRequest(request.id)}
                              >
                                Accept
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleDenyRequest(request.id)}>
                                Deny
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })
                  )}
                </TabsContent>
                <TabsContent value="accepted" className="space-y-4">
                  {acceptedRequests.length === 0 ? (
                    <p className="py-8 text-center text-muted-foreground">No accepted requests</p>
                  ) : (
                    acceptedRequests.map((request) => {
                      const age = request.sender.date_of_birth
                        ? new Date().getFullYear() - new Date(request.sender.date_of_birth).getFullYear()
                        : null
                      return (
                        <Card key={request.id}>
                          <CardContent className="flex items-center gap-4 p-4">
                            <Avatar className="h-20 w-20">
                              <AvatarImage src={request.sender.profile_photo || "/placeholder.svg"} />
                              <AvatarFallback>
                                {request.sender.first_name?.[0]}
                                {request.sender.last_name?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h3 className="font-semibold">
                                {request.sender.first_name} {request.sender.last_name}
                              </h3>
                              <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                                {request.sender.living_in && <span>City: {request.sender.living_in}</span>}
                                {age && <span>Age: {age}</span>}
                                {request.sender.height && <span>Height: {request.sender.height}</span>}
                                {request.sender.profession && <span>Job: {request.sender.profession}</span>}
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                className="mt-2 bg-transparent"
                                onClick={() => router.push(`/profile/${request.sender.id}`)}
                              >
                                View full profile
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })
                  )}
                </TabsContent>
                <TabsContent value="denied" className="space-y-4">
                  {deniedRequests.length === 0 ? (
                    <p className="py-8 text-center text-muted-foreground">No denied requests</p>
                  ) : (
                    deniedRequests.map((request) => {
                      const age = request.sender.date_of_birth
                        ? new Date().getFullYear() - new Date(request.sender.date_of_birth).getFullYear()
                        : null
                      return (
                        <Card key={request.id}>
                          <CardContent className="flex items-center gap-4 p-4">
                            <Avatar className="h-20 w-20">
                              <AvatarImage src={request.sender.profile_photo || "/placeholder.svg"} />
                              <AvatarFallback>
                                {request.sender.first_name?.[0]}
                                {request.sender.last_name?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h3 className="font-semibold">
                                {request.sender.first_name} {request.sender.last_name}
                              </h3>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })
                  )}
                </TabsContent>
                <TabsContent value="sent" className="space-y-4">
                  <Tabs defaultValue="pending-sent" className="w-full">
                    <TabsList>
                      <TabsTrigger value="pending-sent">Pending</TabsTrigger>
                      <TabsTrigger value="accepted-sent">Accepted</TabsTrigger>
                      <TabsTrigger value="denied-sent">Denied</TabsTrigger>
                    </TabsList>
                    <TabsContent value="pending-sent" className="space-y-4">
                      {pendingSent.length === 0 ? (
                        <p className="py-8 text-center text-muted-foreground">No pending sent requests</p>
                      ) : (
                        pendingSent.map((request) => {
                          const age = request.sender.date_of_birth
                            ? new Date().getFullYear() - new Date(request.sender.date_of_birth).getFullYear()
                            : null
                          return (
                            <Card key={request.id}>
                              <CardContent className="flex items-center gap-4 p-4">
                                <Avatar className="h-20 w-20">
                                  <AvatarImage src={request.sender.profile_photo || "/placeholder.svg"} />
                                  <AvatarFallback>
                                    {request.sender.first_name?.[0]}
                                    {request.sender.last_name?.[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <h3 className="font-semibold">
                                    {request.sender.first_name} {request.sender.last_name}
                                  </h3>
                                  <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                                    {request.sender.living_in && <span>City: {request.sender.living_in}</span>}
                                    {age && <span>Age: {age}</span>}
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="mt-2 bg-transparent"
                                    onClick={() => router.push(`/profile/${request.sender.id}`)}
                                  >
                                    View full profile
                                  </Button>
                                  <p className="mt-2 text-xs text-muted-foreground">
                                    Sent on: {new Date(request.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                                <Badge variant="secondary">Pending</Badge>
                              </CardContent>
                            </Card>
                          )
                        })
                      )}
                    </TabsContent>
                    <TabsContent value="accepted-sent" className="space-y-4">
                      {acceptedSent.length === 0 ? (
                        <p className="py-8 text-center text-muted-foreground">No accepted sent requests</p>
                      ) : (
                        acceptedSent.map((request) => (
                          <Card key={request.id}>
                            <CardContent className="flex items-center gap-4 p-4">
                              <Avatar className="h-20 w-20">
                                <AvatarImage src={request.sender.profile_photo || "/placeholder.svg"} />
                                <AvatarFallback>
                                  {request.sender.first_name?.[0]}
                                  {request.sender.last_name?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <h3 className="font-semibold">
                                  {request.sender.first_name} {request.sender.last_name}
                                </h3>
                              </div>
                              <Badge className="bg-green-100 text-green-700">Accepted</Badge>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </TabsContent>
                    <TabsContent value="denied-sent" className="space-y-4">
                      {deniedSent.length === 0 ? (
                        <p className="py-8 text-center text-muted-foreground">No denied sent requests</p>
                      ) : (
                        deniedSent.map((request) => (
                          <Card key={request.id}>
                            <CardContent className="flex items-center gap-4 p-4">
                              <Avatar className="h-20 w-20">
                                <AvatarImage src={request.sender.profile_photo || "/placeholder.svg"} />
                                <AvatarFallback>
                                  {request.sender.first_name?.[0]}
                                  {request.sender.last_name?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <h3 className="font-semibold">
                                  {request.sender.first_name} {request.sender.last_name}
                                </h3>
                              </div>
                              <Badge variant="destructive">Denied</Badge>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </TabsContent>
                  </Tabs>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-serif text-xl font-semibold">Profiles status</h2>
              </div>
              <div className="mb-4 text-center">
                <h3 className="mb-2 text-sm font-medium">Profile completion</h3>
                <div className="relative mx-auto h-32 w-32">
                  <svg className="h-full w-full -rotate-90 transform">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-muted"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      strokeDashoffset={`${2 * Math.PI * 56 * (1 - (currentUser?.profile_completion || 0) / 100)}`}
                      className="text-primary transition-all duration-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold">{currentUser?.profile_completion || 0}%</span>
                  </div>
                </div>
                {currentUser && currentUser.profile_completion < 100 && (
                  <Badge variant="destructive" className="mt-2">
                    Incomplete!
                  </Badge>
                )}
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Interests</span>
                  <span className="font-medium">3/3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Profile photo</span>
                  <span className="font-medium">1/1</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Socials</span>
                  <span className="font-medium">1</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">More data</span>
                  <span className="font-medium">3/5</span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 border-t pt-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-primary">
                    <Heart className="h-4 w-4 fill-current" />
                    <span className="text-2xl font-bold">{likesCount}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Likes</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-primary">
                    <Heart className="h-4 w-4" />
                    <span className="text-2xl font-bold">{interestsCount}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Interests</p>
                </div>
              </div>
              <Button className="mt-4 w-full" onClick={() => router.push("/dashboard/profile/edit")}>
                Complete Profile
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 font-serif text-xl font-semibold">Plan details</h2>
              <div className="text-center">
                <div className="mb-4 flex items-center justify-center">
                  <div className="rounded-full bg-primary/10 p-6">
                    <Award className="h-12 w-12 text-primary" />
                  </div>
                </div>
                <h3 className="mb-2 text-lg font-semibold">Standard plan</h3>
                <p className="mb-1 text-sm text-muted-foreground">Validity 6Months</p>
                <p className="mb-4 text-sm text-muted-foreground">Valid till 24 June 2024</p>
                <Button variant="outline" className="w-full bg-accent/30 hover:bg-accent/50">
                  Upgrade Now
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 font-serif text-xl font-semibold">Recent chat list</h2>
              <div className="space-y-3">
                {recentChats.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">No recent chats</p>
                ) : (
                  recentChats.map((chat) => (
                    <div
                      key={chat.id}
                      className="flex cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-muted/50"
                      onClick={() => router.push("/dashboard/chat")}
                    >
                      <div className="relative">
                        <Avatar>
                          <AvatarImage src={chat.other_user.profile_photo || "/placeholder.svg"} />
                          <AvatarFallback>
                            {chat.other_user.first_name?.[0]}
                            {chat.other_user.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card bg-green-500" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="truncate font-medium">
                          {chat.other_user.first_name} {chat.other_user.last_name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">{chat.other_user.living_in}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
