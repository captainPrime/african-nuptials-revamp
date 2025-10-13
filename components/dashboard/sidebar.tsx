"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, User, Heart, MessageSquare, CreditCard, Settings, LogOut, X, Users } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import Image from "next/image"

interface DashboardSidebarProps {
  isMobileOpen?: boolean
  onMobileClose?: () => void
}

export function DashboardSidebar({ isMobileOpen, onMobileClose }: DashboardSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const fetchUnreadCount = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data: conversations } = await supabase
        .from("conversations")
        .select("id")
        .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)

      if (!conversations) return

      let total = 0
      for (const conv of conversations) {
        const { count } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("conversation_id", conv.id)
          .eq("is_read", false)
          .neq("sender_id", user.id)

        total += count || 0
      }

      setUnreadCount(total)
    }

    fetchUnreadCount()

    const channel = supabase
      .channel("unread-messages")
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => {
        fetchUnreadCount()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const handleLinkClick = () => {
    if (onMobileClose) {
      onMobileClose()
    }
  }

  return (
    <>
      {isMobileOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onMobileClose} />}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-card transition-transform duration-300 lg:static lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-border p-6">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <Image
                    src="/logo.png" // your logo file path (e.g. public/logo.png)
                    alt="AfricaNuptials Logo"
                    width={150}
                    height={150}
                    className="rounded-xl object-cover" // gives the logo nice rounded edges
                  />
                </div>
              </Link>
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMobileClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <nav className="flex-1 space-y-1 p-4">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              const showBadge = item.href === "/dashboard/chat" && unreadCount > 0
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleLinkClick}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                  {showBadge && (
                    <Badge className="ml-auto h-5 min-w-5 rounded-full bg-green-500 px-1.5 text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                </Link>
              )
            })}
          </nav>

          <div className="border-t border-border p-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <LogOut className="h-5 w-5" />
              Log out
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: User, label: "Profile", href: "/dashboard/profile" },
  { icon: Heart, label: "Matches", href: "/dashboard/matches" },
  { icon: Heart, label: "Interests", href: "/dashboard/interests" },
  { icon: Users, label: "Friends", href: "/dashboard/friends" },
  { icon: MessageSquare, label: "Chat list", href: "/dashboard/chat" },
  { icon: CreditCard, label: "Plan", href: "/dashboard/plan" },
  { icon: Settings, label: "Setting", href: "/dashboard/settings" },
]
