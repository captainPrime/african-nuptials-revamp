"use client"

import { useEffect, useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { Profile } from "@/lib/types/profile"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, MoreVertical, Ban, UserX } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Conversation {
  id: string
  participant1_id: string
  participant2_id: string
  last_message: string | null
  last_message_at: string
  other_user: Profile
  unread_count: number
}

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  is_read: boolean
  created_at: string
}

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [currentUser, setCurrentUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isBlocked, setIsBlocked] = useState(false)
  const [isBlockedBy, setIsBlockedBy] = useState(false)
  const supabase = getSupabaseBrowserClient()
  const { toast } = useToast()

  useEffect(() => {
    fetchCurrentUser()
    fetchConversations()
  }, [])

  useEffect(() => {
    if (selectedConversation && currentUser) {
      fetchMessages(selectedConversation.id)
      markMessagesAsRead(selectedConversation.id)
      checkBlockStatus(selectedConversation.other_user.id)

      const channel = supabase
        .channel(`conversation:${selectedConversation.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `conversation_id=eq.${selectedConversation.id}`,
          },
          (payload) => {
            setMessages((prev) => [...prev, payload.new as Message])
            markMessagesAsRead(selectedConversation.id)
          },
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [selectedConversation, currentUser])

  const fetchCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      if (data) setCurrentUser(data)
    }
  }

  const fetchConversations = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
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

      if (error) throw error

      const conversationsWithOtherUser = await Promise.all(
        (data || []).map(async (conv: any) => {
          const otherUser = conv.participant1.id === user.id ? conv.participant2 : conv.participant1

          const { count } = await supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("conversation_id", conv.id)
            .eq("is_read", false)
            .neq("sender_id", user.id)

          return {
            id: conv.id,
            participant1_id: conv.participant1_id,
            participant2_id: conv.participant2_id,
            last_message: conv.last_message,
            last_message_at: conv.last_message_at,
            other_user: otherUser,
            unread_count: count || 0,
          }
        }),
      )

      setConversations(conversationsWithOtherUser)
    } catch (error: any) {
      console.error("[v0] Error fetching conversations:", error)
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })

      if (error) throw error
      setMessages(data || [])
    } catch (error: any) {
      console.error("[v0] Error fetching messages:", error)
    }
  }

  const markMessagesAsRead = async (conversationId: string) => {
    if (!currentUser) return

    await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("conversation_id", conversationId)
      .neq("sender_id", currentUser.id)
      .eq("is_read", false)
  }

  const checkBlockStatus = async (otherUserId: string) => {
    if (!currentUser) return

    const { data: blocked } = await supabase
      .from("blocked_users")
      .select("id")
      .eq("blocker_id", currentUser.id)
      .eq("blocked_id", otherUserId)
      .single()

    setIsBlocked(!!blocked)

    const { data: blockedBy } = await supabase
      .from("blocked_users")
      .select("id")
      .eq("blocker_id", otherUserId)
      .eq("blocked_id", currentUser.id)
      .single()

    setIsBlockedBy(!!blockedBy)
  }

  const handleBlockUser = async () => {
    if (!currentUser || !selectedConversation) return

    if (isBlocked) {
      const { error } = await supabase
        .from("blocked_users")
        .delete()
        .eq("blocker_id", currentUser.id)
        .eq("blocked_id", selectedConversation.other_user.id)

      if (!error) {
        setIsBlocked(false)
        toast({
          title: "User unblocked",
          description: "You can now receive messages from this user",
        })
      }
    } else {
      const { error } = await supabase.from("blocked_users").insert({
        blocker_id: currentUser.id,
        blocked_id: selectedConversation.other_user.id,
      })

      if (!error) {
        setIsBlocked(true)
        toast({
          title: "User blocked",
          description: "This user can no longer send you messages",
        })
      }
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !currentUser) return

    if (isBlocked) {
      toast({
        title: "Cannot send message",
        description: "You have blocked this user. Unblock them to send messages.",
        variant: "destructive",
      })
      return
    }

    if (isBlockedBy) {
      toast({
        title: "Cannot send message",
        description: "You have been blocked by this user",
        variant: "destructive",
      })
      return
    }

    try {
      const { error } = await supabase.from("messages").insert({
        conversation_id: selectedConversation.id,
        sender_id: currentUser.id,
        content: newMessage.trim(),
      })

      if (error) throw error

      setNewMessage("")
      fetchConversations()
    } catch (error: any) {
      console.error("[v0] Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message",
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
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      <Card className="w-full max-w-md">
        <CardContent className="p-0">
          <div className="border-b border-border p-4">
            <h2 className="font-serif text-xl font-semibold">Chat list</h2>
          </div>
          <div className="max-h-[calc(100vh-12rem)] overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="flex h-40 items-center justify-center text-muted-foreground">No conversations yet</div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`flex w-full items-center gap-3 border-b border-border p-4 text-left transition-colors hover:bg-muted ${
                    selectedConversation?.id === conv.id ? "bg-muted" : ""
                  }`}
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={conv.other_user.profile_photo || "/placeholder.svg"} />
                    <AvatarFallback>
                      {conv.other_user.first_name?.[0]}
                      {conv.other_user.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">
                        {conv.other_user.first_name} {conv.other_user.last_name}
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: false })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="truncate text-sm text-muted-foreground">{conv.last_message || "No messages yet"}</p>
                      {conv.unread_count > 0 && (
                        <Badge className="ml-2 h-5 w-5 rounded-full bg-green-500 p-0 text-xs">
                          {conv.unread_count}
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {selectedConversation ? (
        <Card className="flex flex-1 flex-col">
          <CardContent className="flex flex-1 flex-col p-0">
            <div className="flex items-center gap-3 border-b border-border p-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={selectedConversation.other_user.profile_photo || "/placeholder.svg"} />
                <AvatarFallback>
                  {selectedConversation.other_user.first_name?.[0]}
                  {selectedConversation.other_user.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold">
                  {selectedConversation.other_user.first_name} {selectedConversation.other_user.last_name}
                </h3>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {selectedConversation.other_user.living_in && (
                    <span>City: {selectedConversation.other_user.living_in}</span>
                  )}
                  {selectedConversation.other_user.date_of_birth && (
                    <span>
                      Age:{" "}
                      {new Date().getFullYear() - new Date(selectedConversation.other_user.date_of_birth).getFullYear()}
                    </span>
                  )}
                  {selectedConversation.other_user.height && (
                    <span>Height: {selectedConversation.other_user.height}</span>
                  )}
                  {selectedConversation.other_user.profession && (
                    <span>Job: {selectedConversation.other_user.profession}</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {selectedConversation.other_user.membership_plan !== "free" && (
                  <Badge className="bg-primary/10 text-primary capitalize">
                    {selectedConversation.other_user.membership_plan} User
                  </Badge>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(`/profile/${selectedConversation.other_user.id}`, "_blank")}
                >
                  View full profile
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleBlockUser}>
                      {isBlocked ? (
                        <>
                          <UserX className="mr-2 h-4 w-4" />
                          Unblock User
                        </>
                      ) : (
                        <>
                          <Ban className="mr-2 h-4 w-4" />
                          Block User
                        </>
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {isBlockedBy ? (
                <div className="flex h-full flex-col items-center justify-center gap-2">
                  <Ban className="h-12 w-12 text-muted-foreground" />
                  <p className="text-center text-muted-foreground">
                    You have been blocked by this user and cannot send messages.
                  </p>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-2">
                  <div className="rounded-lg bg-[#ffe8ea] px-6 py-3 text-center">
                    <p className="font-medium text-primary">Start a new chat!!! now</p>
                  </div>
                </div>
              ) : (
                messages.map((message) => {
                  const isOwn = message.sender_id === currentUser?.id
                  return (
                    <div key={message.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          isOwn ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            <div className="border-t border-border bg-[#d9b5b8]/20 p-4">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  placeholder={
                    isBlockedBy
                      ? "You cannot send messages"
                      : isBlocked
                        ? "Unblock to send messages"
                        : "Type a message here..."
                  }
                  className="flex-1"
                  disabled={isBlockedBy || isBlocked}
                />
                <Button
                  onClick={sendMessage}
                  className="bg-primary hover:bg-primary/90"
                  disabled={isBlockedBy || isBlocked}
                >
                  SEND <Send className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">Select a conversation to start chatting</p>
        </Card>
      )}
    </div>
  )
}
