"use client"

import { useEffect, useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { Profile } from "@/lib/types/profile"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { MapPin, Briefcase, Ruler, MessageSquare } from "lucide-react"
import { getOrCreateConversation } from "@/lib/utils/chat"

interface Friend {
  id: string
  profile: Profile
  connected_at: string
}

export default function FriendsPage() {
  const [friends, setFriends] = useState<Friend[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const supabase = getSupabaseBrowserClient()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchFriends()
  }, [])

  const fetchFriends = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      setCurrentUserId(user.id)

      // Get all accepted interest requests (both sent and received)
      const { data, error } = await supabase
        .from("interest_requests")
        .select(
          `
          *,
          sender:profiles!interest_requests_sender_id_fkey(*),
          receiver:profiles!interest_requests_receiver_id_fkey(*)
        `,
        )
        .eq("status", "accepted")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("updated_at", { ascending: false })

      if (error) throw error

      const friendsList = (data || []).map((request: any) => ({
        id: request.id,
        profile: request.sender_id === user.id ? request.receiver : request.sender,
        connected_at: request.updated_at,
      }))

      setFriends(friendsList)
    } catch (error: any) {
      console.error("[v0] Error fetching friends:", error)
      toast({
        title: "Error",
        description: "Failed to load friends",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChat = async (friendId: string) => {
    if (!currentUserId) return

    const conversationId = await getOrCreateConversation(currentUserId, friendId)
    if (conversationId) {
      router.push("/dashboard/chat")
    } else {
      toast({
        title: "Error",
        description: "Failed to start chat",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-6 font-serif text-2xl font-bold">Friends</h1>

      {friends.length === 0 ? (
        <Card>
          <CardContent className="flex h-40 items-center justify-center">
            <p className="text-muted-foreground">No friends yet. Accept interest requests to connect!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {friends.map((friend) => {
            const age = friend.profile.date_of_birth
              ? new Date().getFullYear() - new Date(friend.profile.date_of_birth).getFullYear()
              : null

            return (
              <Card key={friend.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={friend.profile.profile_photo || "/placeholder.svg"} />
                      <AvatarFallback className="bg-primary text-lg text-primary-foreground">
                        {friend.profile.first_name?.[0]}
                        {friend.profile.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="mb-2 flex items-start justify-between">
                        <div>
                          <h3 className="font-serif text-lg font-semibold">
                            {friend.profile.first_name} {friend.profile.last_name}
                          </h3>
                          <div className="mt-1 flex flex-wrap gap-3 text-sm text-muted-foreground">
                            {friend.profile.living_in && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                <span>{friend.profile.living_in}</span>
                              </div>
                            )}
                            {age && <span>Age: {age}</span>}
                            {friend.profile.height && (
                              <div className="flex items-center gap-1">
                                <Ruler className="h-3 w-3" />
                                <span>{friend.profile.height}</span>
                              </div>
                            )}
                            {friend.profile.profession && (
                              <div className="flex items-center gap-1">
                                <Briefcase className="h-3 w-3" />
                                <span>{friend.profile.profession}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        {friend.profile.membership_plan !== "free" && (
                          <Badge variant="secondary" className="bg-primary/10 text-primary">
                            {friend.profile.membership_plan}
                          </Badge>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleChat(friend.profile.id)}>
                          <MessageSquare className="mr-1 h-4 w-4" />
                          Chat now
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/profile/${friend.profile.id}`)}
                        >
                          View profile
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
