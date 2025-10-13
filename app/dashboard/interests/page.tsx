"use client"

import { useEffect, useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { InterestRequest } from "@/lib/types/profile"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Pagination } from "@/components/ui/pagination"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { InterestRequestCard } from "@/components/interest-request-card"

const ITEMS_PER_PAGE = 10

export default function InterestsPage() {
  const [requests, setRequests] = useState<InterestRequest[]>([])
  const [sentRequests, setSentRequests] = useState<InterestRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("new")
  const [currentUserId, setCurrentUserId] = useState<string>("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalRequests, setTotalRequests] = useState(0)
  const supabase = getSupabaseBrowserClient()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchRequests()
  }, [currentPage, activeTab])

  const fetchRequests = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      setCurrentUserId(user.id)

      const offset = (currentPage - 1) * ITEMS_PER_PAGE

      const { data, error, count } = await supabase
        .from("interest_requests")
        .select(
          `
          *,
          sender:profiles!interest_requests_sender_id_fkey(*),
          receiver:profiles!interest_requests_receiver_id_fkey(*)
        `,
          { count: "exact" },
        )
        .eq("receiver_id", user.id)
        .neq("sender_id", user.id)
        .order("created_at", { ascending: false })
        .range(offset, offset + ITEMS_PER_PAGE - 1)

      if (error) throw error
      setRequests(data || [])
      setTotalRequests(count || 0)

      const {
        data: sent,
        error: sentError,
        count: sentCount,
      } = await supabase
        .from("interest_requests")
        .select(
          `
          *,
          sender:profiles!interest_requests_sender_id_fkey(*),
          receiver:profiles!interest_requests_receiver_id_fkey(*)
        `,
          { count: "exact" },
        )
        .eq("sender_id", user.id)
        .neq("receiver_id", user.id)
        .order("created_at", { ascending: false })
        .range(offset, offset + ITEMS_PER_PAGE - 1)

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

  const getTotalPages = () => {
    if (activeTab === "new") return Math.ceil(newRequests.length / ITEMS_PER_PAGE)
    if (activeTab === "accepted") return Math.ceil(acceptedRequests.length / ITEMS_PER_PAGE)
    if (activeTab === "denied") return Math.ceil(deniedRequests.length / ITEMS_PER_PAGE)
    if (activeTab === "sent") return Math.ceil(sentRequests.length / ITEMS_PER_PAGE)
    return 1
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-3 sm:px-6">
      <h1 className="mb-4 sm:mb-6 font-serif text-xl sm:text-2xl font-bold">Interest request</h1>

      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value)
          setCurrentPage(1)
        }}
      >
        <TabsList className="mb-4 sm:mb-6 grid h-auto w-full grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-0">
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
                <p className="text-sm text-muted-foreground">No new requests</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="space-y-3 sm:space-y-4">
                {newRequests.map((request) => (
                  <InterestRequestCard
                    key={request.id}
                    request={request}
                    currentUserId={currentUserId}
                    onAccept={handleAccept}
                    onDeny={handleDeny}
                  />
                ))}
              </div>
              {getTotalPages() > 1 && (
                <div className="mt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={getTotalPages()}
                    onPageChange={setCurrentPage}
                    itemsPerPage={ITEMS_PER_PAGE}
                    totalItems={newRequests.length}
                  />
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="accepted">
          {acceptedRequests.length === 0 ? (
            <Card>
              <CardContent className="flex h-40 items-center justify-center">
                <p className="text-sm text-muted-foreground">No accepted requests</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="space-y-3 sm:space-y-4">
                {acceptedRequests.map((request) => (
                  <InterestRequestCard key={request.id} request={request} currentUserId={currentUserId} />
                ))}
              </div>
              {getTotalPages() > 1 && (
                <div className="mt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={getTotalPages()}
                    onPageChange={setCurrentPage}
                    itemsPerPage={ITEMS_PER_PAGE}
                    totalItems={acceptedRequests.length}
                  />
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="denied">
          {deniedRequests.length === 0 ? (
            <Card>
              <CardContent className="flex h-40 items-center justify-center">
                <p className="text-sm text-muted-foreground">No denied requests</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="space-y-3 sm:space-y-4">
                {deniedRequests.map((request) => (
                  <InterestRequestCard key={request.id} request={request} currentUserId={currentUserId} />
                ))}
              </div>
              {getTotalPages() > 1 && (
                <div className="mt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={getTotalPages()}
                    onPageChange={setCurrentPage}
                    itemsPerPage={ITEMS_PER_PAGE}
                    totalItems={deniedRequests.length}
                  />
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="sent">
          {sentRequests.length === 0 ? (
            <Card>
              <CardContent className="flex h-40 items-center justify-center">
                <p className="text-sm text-muted-foreground">No sent requests</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="space-y-3 sm:space-y-4">
                {sentRequests.map((request) => (
                  <InterestRequestCard
                    key={request.id}
                    request={request}
                    currentUserId={currentUserId}
                    isSent={true}
                    onCancel={handleCancelRequest}
                  />
                ))}
              </div>
              {getTotalPages() > 1 && (
                <div className="mt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={getTotalPages()}
                    onPageChange={setCurrentPage}
                    itemsPerPage={ITEMS_PER_PAGE}
                    totalItems={sentRequests.length}
                  />
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
