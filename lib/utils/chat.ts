import { getSupabaseBrowserClient } from "@/lib/supabase/client"

export async function checkIfFriends(userId1: string, userId2: string): Promise<boolean> {
  const supabase = getSupabaseBrowserClient()

  // Check if there's a mutual accepted interest request
  const { data, error } = await supabase
    .from("interest_requests")
    .select("*")
    .or(
      `and(sender_id.eq.${userId1},receiver_id.eq.${userId2},status.eq.accepted),and(sender_id.eq.${userId2},receiver_id.eq.${userId1},status.eq.accepted)`,
    )
    .limit(1)

  if (error) {
    console.error("[v0] Error checking friendship:", error)
    return false
  }

  return (data?.length || 0) > 0
}

export async function getOrCreateConversation(userId1: string, userId2: string): Promise<string | null> {
  const supabase = getSupabaseBrowserClient()

  // Ensure consistent ordering for unique constraint
  const [participant1, participant2] = [userId1, userId2].sort()

  // Try to find existing conversation
  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("participant1_id", participant1)
    .eq("participant2_id", participant2)
    .single()

  if (existing) {
    return existing.id
  }

  // Create new conversation
  const { data: newConv, error } = await supabase
    .from("conversations")
    .insert({
      participant1_id: participant1,
      participant2_id: participant2,
    })
    .select("id")
    .single()

  if (error) {
    console.error("[v0] Error creating conversation:", error)
    return null
  }

  return newConv.id
}
