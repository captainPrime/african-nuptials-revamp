"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Globe,
  Menu,
  LayoutDashboard,
  User,
  Heart,
  MessageSquare,
  CreditCard,
  Settings,
  LogOut,
  Users,
} from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { Profile } from "@/lib/types/profile"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter, usePathname } from "next/navigation"

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: User, label: "Profile", href: "/dashboard/profile" },
  { icon: Heart, label: "Interests", href: "/dashboard/interests" },
  { icon: Users, label: "Friends", href: "/dashboard/friends" },
  { icon: MessageSquare, label: "Chat list", href: "/dashboard/chat" },
  { icon: CreditCard, label: "Plan", href: "/dashboard/plan" },
  { icon: Settings, label: "Setting", href: "/dashboard/settings" },
]

interface DashboardHeaderProps {
  onMobileMenuToggle?: () => void
}

export function DashboardHeader({ onMobileMenuToggle }: DashboardHeaderProps) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const supabase = getSupabaseBrowserClient()
  const router = useRouter()
  const pathname = usePathname()

  const getPageTitle = () => {
    const currentItem = menuItems.find((item) => item.href === pathname)
    return currentItem?.label || "Dashboard"
  }

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

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <header className="border-b border-border bg-card">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMobileMenuToggle}>
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="font-serif text-xl font-semibold">{getPageTitle()}</h1>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="gap-2">
            <Globe className="h-4 w-4" />
            English
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar>
                  <AvatarImage src={profile?.profile_photo || "/placeholder.svg"} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {profile?.first_name?.[0]}
                    {profile?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {profile?.first_name} {profile?.last_name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">@{profile?.first_name?.toLowerCase()}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <DropdownMenuItem key={item.href} onClick={() => router.push(item.href)}>
                    <Icon className="mr-2 h-4 w-4" />
                    <span>{item.label}</span>
                  </DropdownMenuItem>
                )
              })}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
