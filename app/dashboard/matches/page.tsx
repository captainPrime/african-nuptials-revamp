"use client"

import { useEffect, useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { Profile } from "@/lib/types/profile"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import {
  MapPin,
  Briefcase,
  GraduationCap,
  MessageCircle,
  UserPlus,
  Heart,
  Ruler,
  Church,
  Baby,
  Cigarette,
  Wine,
  Target,
  Check,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { getCompatibleMatches, type MatchScore } from "@/lib/utils/matching-algorithm"

export default function MatchesPage() {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null)
  const [matches, setMatches] = useState<MatchScore[]>([])
  const [selectedMatch, setSelectedMatch] = useState<MatchScore | null>(null)
  const [loading, setLoading] = useState(true)
  const [friendships, setFriendships] = useState<Set<string>>(new Set())
  const [pendingRequests, setPendingRequests] = useState<Set<string>>(new Set())
  const supabase = getSupabaseBrowserClient()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchMatches = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/")
        return
      }

      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      if (profile) setCurrentUser(profile)

      const compatibleMatches = await getCompatibleMatches(user.id, 50)
      setMatches(compatibleMatches)

      const { data: acceptedRequests } = await supabase
        .from("interest_requests")
        .select("sender_id, receiver_id")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .eq("status", "accepted")

      if (acceptedRequests) {
        const friendSet = new Set<string>()
        acceptedRequests.forEach((req) => {
          const friendId = req.sender_id === user.id ? req.receiver_id : req.sender_id
          friendSet.add(friendId)
        })
        setFriendships(friendSet)
      }

      const { data: pendingRequestsData } = await supabase
        .from("interest_requests")
        .select("receiver_id")
        .eq("sender_id", user.id)
        .eq("status", "pending")

      if (pendingRequestsData) {
        const pendingSet = new Set<string>()
        pendingRequestsData.forEach((req) => {
          pendingSet.add(req.receiver_id)
        })
        setPendingRequests(pendingSet)
      }

      setLoading(false)
    }

    fetchMatches()
  }, [supabase, router])

  const handleSendInterest = async (profileId: string) => {
    if (!currentUser) return

    if (pendingRequests.has(profileId) || friendships.has(profileId)) {
      toast({
        title: "Request already sent",
        description: "You have already sent an interest request to this user",
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
      toast({
        title: "Error",
        description: "Failed to send interest request",
        variant: "destructive",
      })
    } else {
      setPendingRequests((prev) => new Set(prev).add(profileId))
      toast({
        title: "Interest sent!",
        description: "Your interest request has been sent",
      })
    }
  }

  const handleMessage = async (profileId: string) => {
    if (!currentUser) return

    const { data: existingConv } = await supabase
      .from("conversations")
      .select("id")
      .or(
        `and(participant1_id.eq.${currentUser.id},participant2_id.eq.${profileId}),and(participant1_id.eq.${profileId},participant2_id.eq.${currentUser.id})`,
      )
      .maybeSingle()

    if (existingConv) {
      router.push("/dashboard/chat")
    } else {
      const { data: newConv, error } = await supabase
        .from("conversations")
        .insert({
          participant1_id: currentUser.id,
          participant2_id: profileId,
        })
        .select()
        .single()

      if (error) {
        toast({
          title: "Error",
          description: "Failed to start conversation",
          variant: "destructive",
        })
      } else {
        router.push("/dashboard/chat")
      }
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
    <div className="space-y-6 p-3 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold">Your Matches</h1>
          <p className="text-muted-foreground">
            {matches.length} compatible {matches.length === 1 ? "match" : "matches"} found
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {matches.map((matchScore) => {
          const match = matchScore.profile
          const age = match.date_of_birth
            ? new Date().getFullYear() - new Date(match.date_of_birth).getFullYear()
            : null
          const isFriend = friendships.has(match.id)
          const isPending = pendingRequests.has(match.id)

          return (
            <Card
              key={match.id}
              className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg"
              onClick={() => setSelectedMatch(matchScore)}
            >
              <div className="flex flex-col sm:flex-row">
                <div className="relative h-64 w-full shrink-0 sm:h-48 sm:w-48">
                  <img
                    src={match.profile_photo || "/placeholder.svg?height=300&width=300"}
                    alt={match.first_name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <Badge className="absolute right-2 top-2 bg-green-500 text-xs font-semibold text-white">
                    {Math.round(matchScore.compatibility_score)}% Match
                  </Badge>
                  {isFriend && (
                    <Badge className="absolute right-2 top-10 bg-blue-500 text-xs font-semibold text-white">
                      Friend
                    </Badge>
                  )}
                  {isPending && !isFriend && (
                    <Badge className="absolute right-2 top-10 bg-orange-500 text-xs font-semibold text-white">
                      Request Sent
                    </Badge>
                  )}
                </div>

                <div className="flex flex-1 flex-col justify-between p-6">
                  <div>
                    <div className="mb-3 flex items-start justify-between">
                      <div>
                        <h3 className="font-serif text-2xl font-bold">
                          {match.first_name} {match.last_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{age && `${age} years old`}</p>
                      </div>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                      {match.living_in && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{match.living_in}</span>
                        </div>
                      )}
                      {match.profession && (
                        <div className="flex items-center gap-2 text-sm">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <span>{match.profession}</span>
                        </div>
                      )}
                      {match.education && (
                        <div className="flex items-center gap-2 text-sm">
                          <GraduationCap className="h-4 w-4 text-muted-foreground" />
                          <span>{match.education}</span>
                        </div>
                      )}
                      {match.religion && (
                        <div className="flex items-center gap-2 text-sm">
                          <Church className="h-4 w-4 text-muted-foreground" />
                          <span>{match.religion}</span>
                        </div>
                      )}
                    </div>

                    {match.bio && <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{match.bio}</p>}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {match.hobbies &&
                      match.hobbies.slice(0, 3).map((hobby, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {hobby}
                        </Badge>
                      ))}
                    {match.hobbies && match.hobbies.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{match.hobbies.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <Sheet open={!!selectedMatch} onOpenChange={() => setSelectedMatch(null)}>
        <SheetContent side="left" className="w-full overflow-y-auto sm:max-w-lg">
          {selectedMatch && (
            <>
              <SheetHeader className="mb-6">
                <SheetTitle className="sr-only">Profile Preview</SheetTitle>
              </SheetHeader>

              <div className="space-y-6">
                <div className="relative">
                  <div className="aspect-[4/5] overflow-hidden rounded-xl">
                    <img
                      src={selectedMatch.profile.profile_photo || "/placeholder.svg?height=600&width=480"}
                      alt={selectedMatch.profile.first_name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="absolute right-3 top-3 flex flex-col gap-2">
                    <Badge className="bg-green-500 text-sm font-semibold text-white shadow-lg">
                      {Math.round(selectedMatch.compatibility_score)}% Match
                    </Badge>
                    {friendships.has(selectedMatch.profile.id) && (
                      <Badge className="bg-blue-500 text-sm font-semibold text-white shadow-lg">Friend</Badge>
                    )}
                    {pendingRequests.has(selectedMatch.profile.id) && !friendships.has(selectedMatch.profile.id) && (
                      <Badge className="bg-orange-500 text-sm font-semibold text-white shadow-lg">Request Sent</Badge>
                    )}
                  </div>
                </div>

                <div>
                  <h2 className="font-serif text-3xl font-bold">
                    {selectedMatch.profile.first_name} {selectedMatch.profile.last_name}
                  </h2>
                  <p className="mt-1 text-lg text-muted-foreground">
                    {selectedMatch.profile.date_of_birth &&
                      `${new Date().getFullYear() - new Date(selectedMatch.profile.date_of_birth).getFullYear()} years old`}
                  </p>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Profile Details</h3>
                  <div className="grid gap-3">
                    {selectedMatch.profile.living_in && (
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <MapPin className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Location</p>
                          <p className="font-medium">{selectedMatch.profile.living_in}</p>
                        </div>
                      </div>
                    )}
                    {selectedMatch.profile.profession && (
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <Briefcase className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Profession</p>
                          <p className="font-medium">{selectedMatch.profile.profession}</p>
                        </div>
                      </div>
                    )}
                    {selectedMatch.profile.education && (
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <GraduationCap className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Education</p>
                          <p className="font-medium">{selectedMatch.profile.education}</p>
                        </div>
                      </div>
                    )}
                    {selectedMatch.profile.religion && (
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <Church className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Religion</p>
                          <p className="font-medium">{selectedMatch.profile.religion}</p>
                        </div>
                      </div>
                    )}
                    {selectedMatch.profile.height && (
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <Ruler className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Height</p>
                          <p className="font-medium">{selectedMatch.profile.height}</p>
                        </div>
                      </div>
                    )}
                    {selectedMatch.profile.marital_status && (
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <Heart className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Marital Status</p>
                          <p className="font-medium">{selectedMatch.profile.marital_status}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {selectedMatch.profile.bio && (
                  <>
                    <div>
                      <h3 className="mb-3 font-semibold text-lg">About</h3>
                      <p className="leading-relaxed text-muted-foreground">{selectedMatch.profile.bio}</p>
                    </div>
                    <Separator />
                  </>
                )}

                {selectedMatch.profile.hobbies && selectedMatch.profile.hobbies.length > 0 && (
                  <>
                    <div>
                      <h3 className="mb-3 font-semibold text-lg">Interests & Hobbies</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedMatch.profile.hobbies.map((hobby, index) => (
                          <Badge key={index} variant="secondary" className="px-3 py-1">
                            {hobby}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                {(selectedMatch.profile.looking_for ||
                  selectedMatch.profile.children ||
                  selectedMatch.profile.smoking ||
                  selectedMatch.profile.drinking) && (
                  <>
                    <div>
                      <h3 className="mb-3 font-semibold text-lg">Lifestyle & Preferences</h3>
                      <div className="grid gap-3">
                        {selectedMatch.profile.looking_for && (
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                              <Target className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Looking For</p>
                              <p className="font-medium">{selectedMatch.profile.looking_for}</p>
                            </div>
                          </div>
                        )}
                        {selectedMatch.profile.children && (
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                              <Baby className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Children</p>
                              <p className="font-medium">{selectedMatch.profile.children}</p>
                            </div>
                          </div>
                        )}
                        {selectedMatch.profile.smoking && (
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                              <Cigarette className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Smoking</p>
                              <p className="font-medium">{selectedMatch.profile.smoking}</p>
                            </div>
                          </div>
                        )}
                        {selectedMatch.profile.drinking && (
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                              <Wine className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Drinking</p>
                              <p className="font-medium">{selectedMatch.profile.drinking}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                <div className="flex gap-3 pb-6">
                  {friendships.has(selectedMatch.profile.id) ? (
                    <Button className="flex-1" size="lg" onClick={() => handleMessage(selectedMatch.profile.id)}>
                      <MessageCircle className="mr-2 h-5 w-5" />
                      Message
                    </Button>
                  ) : pendingRequests.has(selectedMatch.profile.id) ? (
                    <Button className="flex-1" size="lg" disabled>
                      <Check className="mr-2 h-5 w-5" />
                      Request Sent
                    </Button>
                  ) : (
                    <Button className="flex-1" size="lg" onClick={() => handleSendInterest(selectedMatch.profile.id)}>
                      <UserPlus className="mr-2 h-5 w-5" />
                      Send Interest
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => router.push(`/profile/${selectedMatch.profile.id}`)}
                  >
                    View Full Profile
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
