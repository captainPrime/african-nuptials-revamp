"use client"

import { useEffect, useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { InterestRequest } from "@/lib/types/profile"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { MapPin, Briefcase, Ruler, X } from "lucide-react"

export default function InterestsPage() {
  const [requests, setRequests] = useState<InterestRequest[]>([])
  const [sentRequests, setSentRequests] = useState<InterestRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("new")
  const [currentUserId, setCurrentUserId] = useState<string>("")
  const supabase = getSupabaseBrowserClient()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      setCurrentUserId(user.id)

      const { data, error } = await supabase
        .from("interest_requests")
        .select(
          `
          *,
          sender:profiles!interest_requests_sender_id_fkey(*),
          receiver:profiles!interest_requests_receiver_id_fkey(*)
        `,
        )
        .eq("receiver_id", user.id)
        .neq("sender_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setRequests(data || [])

      const { data: sent, error: sentError } = await supabase
        .from("interest_requests")
        .select(
          `
          *,
          sender:profiles!interest_requests_sender_id_fkey(*),
          receiver:profiles!interest_requests_receiver_id_fkey(*)
        `,
        )
        .eq("sender_id", user.id)
        .neq("receiver_id", user.id)
        .order("created_at", { ascending: false })

      if (sentError) throw sentError
      setSentRequests(sent || [])
    } catch (error: any) {
      console.error("[v0] Error fetching requests:", error)
      toast({
        title: "Error",
        description: "Failed to load interest requests",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (requestId: string) => {
    try {
      const { error } = await supabase.from("interest_requests").update({ status: "accepted" }).eq("id", requestId)

      if (error) throw error

      toast({
        title: "Request accepted",
        description: "You have accepted this interest request",
      })

      fetchRequests()
    } catch (error: any) {
      console.error("[v0] Error accepting request:", error)
      toast({
        title: "Error",
        description: "Failed to accept request",
        variant: "destructive",
      })
    }
  }

  const handleDeny = async (requestId: string) => {
    try {
      const { error } = await supabase.from("interest_requests").update({ status: "denied" }).eq("id", requestId)

      if (error) throw error

      toast({
        title: "Request denied",
        description: "You have denied this interest request",
      })

      fetchRequests()
    } catch (error: any) {
      console.error("[v0] Error denying request:", error)
      toast({
        title: "Error",
        description: "Failed to deny request",
        variant: "destructive",
      })
    }
  }

  const handleCancelRequest = async (requestId: string) => {
    try {
      const { error } = await supabase.from("interest_requests").delete().eq("id", requestId)

      if (error) throw error

      toast({
        title: "Request canceled",
        description: "You have canceled this interest request",
      })

      fetchRequests()
    } catch (error: any) {
      console.error("[v0] Error canceling request:", error)
      toast({
        title: "Error",
        description: "Failed to cancel request",
        variant: "destructive",
      })
    }
  }

  const newRequests = requests.filter((r) => r.status === "pending")
  const acceptedRequests = requests.filter((r) => r.status === "accepted")
  const deniedRequests = requests.filter((r) => r.status === "denied")

  const RequestCard = ({ request, isSent = false }: { request: InterestRequest; isSent?: boolean }) => {
    const sender = request.sender
    const receiver = request.receiver
    const profile = isSent ? receiver : sender
    if (!profile) return null

    const age = profile.date_of_birth ? new Date().getFullYear() - new Date(profile.date_of_birth).getFullYear() : null

    const isOwnSentRequest = isSent && request.sender_id === currentUserId

    return (
      <Card className="mb-4">
        <CardContent className="flex items-center gap-4 p-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profile.profile_photo || "/placeholder.svg"} />
            <AvatarFallback className="bg-primary text-lg text-primary-foreground">
              {profile.first_name?.[0]}
              {profile.last_name?.[0]}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="mb-2 flex items-start justify-between">
              <div>
                <h3 className="font-serif text-lg font-semibold">
                  {profile.first_name} {profile.last_name}
                </h3>
                <div className="mt-1 flex flex-wrap gap-3 text-sm text-muted-foreground">
                  {profile.living_in && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>City: {profile.living_in}</span>
                    </div>
                  )}
                  {age && (
                    <div className="flex items-center gap-1">
                      <span>Age: {age}</span>
                    </div>
                  )}
                  {profile.height && (
                    <div className="flex items-center gap-1">
                      <Ruler className="h-3 w-3" />
                      <span>Height: {profile.height}</span>
                    </div>
                  )}
                  {profile.profession && (
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-3 w-3" />
                      <span>Job: {profile.profession}</span>
                    </div>
                  )}
                </div>
              </div>
              {!isSent && sender && sender.membership_plan !== "free" && (
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {sender.membership_plan}
                </Badge>
              )}
              {isSent && (
                <Badge
                  variant="secondary"
                  className={
                    request.status === "accepted"
                      ? "bg-green-100 text-green-700"
                      : request.status === "denied"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                  }
                >
                  {request.status}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button size="sm" variant="outline" onClick={() => router.push(`/profile/${profile.id}`)}>
                View full profile
              </Button>
              <span className="text-xs text-muted-foreground">
                {isSent ? "Sent on" : "Request on"}:{" "}
                {new Date(request.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          {!isSent && request.status === "pending" && sender && (
            <div className="flex gap-2">
              <Button
                size="sm"
                className="bg-[#ffe8ea] text-primary hover:bg-[#ffd6da]"
                onClick={() => handleAccept(request.id)}
              >
                Accept
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleDeny(request.id)}>
                Deny
              </Button>
            </div>
          )}

          {isSent && request.status === "pending" && isOwnSentRequest && (
            <Button
              size="sm"
              variant="outline"
              className="border-destructive/20 text-destructive hover:bg-destructive/10 bg-transparent"
              onClick={() => handleCancelRequest(request.id)}
            >
              <X className="mr-1 h-4 w-4" />
              Cancel
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6">
      <h1 className="mb-6 font-serif text-2xl font-bold">Interest request</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 grid h-auto w-full grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-0">
          <TabsTrigger value="new" className="text-xs sm:text-sm">
            New
          </TabsTrigger>
          <TabsTrigger value="accepted" className="text-xs sm:text-sm">
            Accepted
          </TabsTrigger>
          <TabsTrigger value="denied" className="text-xs sm:text-sm">
            Denied
          </TabsTrigger>
          <TabsTrigger value="sent" className="text-xs sm:text-sm">
            Sent
          </TabsTrigger>
        </TabsList>

        <TabsContent value="new">
          {newRequests.length === 0 ? (
            <Card>
              <CardContent className="flex h-40 items-center justify-center">
                <p className="text-muted-foreground">No new requests</p>
              </CardContent>
            </Card>
          ) : (
            newRequests.map((request) => <RequestCard key={request.id} request={request} />)
          )}
        </TabsContent>

        <TabsContent value="accepted">
          {acceptedRequests.length === 0 ? (
            <Card>
              <CardContent className="flex h-40 items-center justify-center">
                <p className="text-muted-foreground">No accepted requests</p>
              </CardContent>
            </Card>
          ) : (
            acceptedRequests.map((request) => <RequestCard key={request.id} request={request} />)
          )}
        </TabsContent>

        <TabsContent value="denied">
          {deniedRequests.length === 0 ? (
            <Card>
              <CardContent className="flex h-40 items-center justify-center">
                <p className="text-muted-foreground">No denied requests</p>
              </CardContent>
            </Card>
          ) : (
            deniedRequests.map((request) => <RequestCard key={request.id} request={request} />)
          )}
        </TabsContent>

        <TabsContent value="sent">
          {sentRequests.length === 0 ? (
            <Card>
              <CardContent className="flex h-40 items-center justify-center">
                <p className="text-muted-foreground">No sent requests</p>
              </CardContent>
            </Card>
          ) : (
            sentRequests.map((request) => <RequestCard key={request.id} request={request} isSent={true} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
