"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Globe, User, LogOut } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useEffect, useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export function Header({ onSignUpClick, onLoginClick }: { onSignUpClick: () => void; onLoginClick: () => void }) {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const supabase = getSupabaseBrowserClient()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        // Fetch profile data
        const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single()
        setProfile(profileData)
      }
    }

    checkAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()
          .then(({ data }) => setProfile(data))
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })
    router.push("/")
    router.refresh()
  }

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M16 4C16 4 12 8 12 12C12 14.2091 13.7909 16 16 16C18.2091 16 20 14.2091 20 12C20 8 16 4 16 4Z"
                fill="currentColor"
                className="text-primary"
              />
              <path
                d="M8 16C8 16 4 20 4 24C4 26.2091 5.79086 28 8 28C10.2091 28 12 26.2091 12 24C12 20 8 16 8 16Z"
                fill="currentColor"
                className="text-primary"
              />
              <path
                d="M24 16C24 16 20 20 20 24C20 26.2091 21.7909 28 24 28C26.2091 28 28 26.2091 28 24C28 20 24 16 24 16Z"
                fill="currentColor"
                className="text-primary"
              />
            </svg>
            <span className="font-serif text-xl font-semibold text-primary">AfricaNuptials</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/about" className="text-sm font-medium text-foreground/80 hover:text-foreground">
            About
          </Link>
          <Link href="/membership" className="text-sm font-medium text-foreground/80 hover:text-foreground">
            Membership
          </Link>
          <Link href="/news" className="text-sm font-medium text-foreground/80 hover:text-foreground">
            News
          </Link>
          <Link href="/contact" className="text-sm font-medium text-foreground/80 hover:text-foreground">
            Contact
          </Link>
          <Link href="/faq" className="text-sm font-medium text-foreground/80 hover:text-foreground">
            FAQ
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">English</span>
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  {profile?.profile_photo ? (
                    <img
                      src={profile.profile_photo || "/placeholder.svg"}
                      alt="Profile"
                      className="h-6 w-6 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">
                    {profile?.first_name || user.email?.split("@")[0] || "Profile"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                  <User className="mr-2 h-4 w-4" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={onLoginClick}>
                Login
              </Button>
              <Button
                size="sm"
                onClick={onSignUpClick}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Sign Up
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
