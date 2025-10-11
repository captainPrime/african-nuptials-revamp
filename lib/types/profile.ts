export type ProfileCreatedFor =
  | "myself"
  | "my_son"
  | "my_daughter"
  | "my_brother"
  | "my_sister"
  | "my_friend"
  | "my_relative"
export type Gender = "male" | "female"
export type MembershipPlan = "free" | "premium" | "vip"

export interface Profile {
  id: string
  email: string
  phone?: string
  first_name: string
  last_name: string
  gender: Gender
  date_of_birth: string
  profile_created_for: ProfileCreatedFor
  religion?: string
  community?: string
  living_in?: string
  height?: string
  weight?: string
  body_type?: string
  complexion?: string
  education?: string
  profession?: string
  company?: string
  annual_income?: string
  father_name?: string
  mother_name?: string
  siblings?: string
  family_type?: string
  family_status?: string
  diet?: string
  smoking?: string
  drinking?: string
  hobbies?: string[]
  about_me?: string
  partner_expectations?: string
  profile_photo?: string
  cover_photo?: string
  photo_gallery?: string[]
  facebook_url?: string
  twitter_url?: string
  instagram_url?: string
  linkedin_url?: string
  profile_completion: number
  is_verified: boolean
  membership_plan: MembershipPlan
  profile_views: number
  likes_received: number
  interests_received: number
  clicks_received: number
  created_at: string
  updated_at: string
}

export interface SignupFormData {
  email: string
  phone: string
  password: string
  profile_created_for: ProfileCreatedFor
  gender: Gender
  first_name: string
  last_name: string
  date_of_birth: {
    day: string
    month: string
    year: string
  }
  religion: string
  community: string
  living_in: string
}

export type InterestRequestStatus = "pending" | "accepted" | "denied"

export interface InterestRequest {
  id: string
  sender_id: string
  receiver_id: string
  status: InterestRequestStatus
  message?: string
  created_at: string
  updated_at: string
  sender?: Profile
  receiver?: Profile
}
