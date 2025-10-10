"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { Profile } from "@/lib/types/profile"

export function DashboardHeader() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()
        if (data) setProfile(data)
      }
    }
    fetchProfile()
  }, [supabase])

  return (
    <header className="border-b border-border bg-card">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <h1 className="font-serif text-xl font-semibold">Profile</h1>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="gap-2">
            <Globe className="h-4 w-4" />
            English
          </Button>
          <Avatar>
            <AvatarImage src={profile?.profile_photo || "/placeholder.svg"} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {profile?.first_name?.[0]}
              {profile?.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
