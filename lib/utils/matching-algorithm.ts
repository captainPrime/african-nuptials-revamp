import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { Profile } from "@/lib/types/profile"

export interface MatchScore {
  profile: Profile
  compatibility_score: number
  age_score: number
  location_score: number
  religion_score: number
  education_score: number
  interests_score: number
  behavior_score: number
}

/**
 * Get high-compatibility matches for a user using the True Match Algorithm
 * This algorithm considers:
 * - Age compatibility (20 points)
 * - Location proximity (25 points)
 * - Religion match (20 points)
 * - Education level (15 points)
 * - Shared interests (10 points)
 * - User behavior/engagement (10 points)
 * Total: 100 points
 */
export async function getCompatibleMatches(userId: string, limit = 10): Promise<MatchScore[]> {
  const supabase = getSupabaseBrowserClient()

  // Get current user profile
  const { data: currentUser } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (!currentUser) return []

  // Get potential matches (opposite gender, not blocked, active)
  const { data: potentialMatches } = await supabase
    .from("profiles")
    .select("*")
    .neq("id", userId)
    .neq("gender", currentUser.gender)
    .eq("is_active", true)
    .limit(50) // Get more profiles to calculate scores

  if (!potentialMatches || potentialMatches.length === 0) return []

  // Calculate match scores for each potential match
  const matchScores: MatchScore[] = []

  for (const match of potentialMatches) {
    // Call the database function to calculate score
    const { data: scoreData } = await supabase.rpc("calculate_match_score", {
      p_user_id: userId,
      p_target_id: match.id,
    })

    // Get the detailed scores
    const { data: detailedScore } = await supabase
      .from("match_scores")
      .select("*")
      .eq("user_id", userId)
      .eq("matched_profile_id", match.id)
      .single()

    if (detailedScore) {
      matchScores.push({
        profile: match,
        compatibility_score: detailedScore.compatibility_score,
        age_score: detailedScore.age_score,
        location_score: detailedScore.location_score,
        religion_score: detailedScore.religion_score,
        education_score: detailedScore.education_score,
        interests_score: detailedScore.interests_score,
        behavior_score: detailedScore.behavior_score,
      })
    }
  }

  // Sort by compatibility score and return top matches
  return matchScores.sort((a, b) => b.compatibility_score - a.compatibility_score).slice(0, limit)
}

/**
 * Track user interaction for behavior-based matching
 */
export async function trackInteraction(
  userId: string,
  targetProfileId: string,
  interactionType: "view" | "like" | "interest" | "message" | "profile_click",
) {
  const supabase = getSupabaseBrowserClient()

  await supabase.from("user_interactions").insert({
    user_id: userId,
    target_profile_id: targetProfileId,
    interaction_type: interactionType,
  })

  // Recalculate match score after interaction
  await supabase.rpc("calculate_match_score", {
    p_user_id: userId,
    p_target_id: targetProfileId,
  })
}
