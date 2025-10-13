"use client"

import type React from "react"

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
import { useRouter, usePathname } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

export function Header({ onSignUpClick, onLoginClick }: { onSignUpClick: () => void; onLoginClick: () => void }) {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const supabase = getSupabaseBrowserClient()
  const router = useRouter()
  const pathname = usePathname()
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

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault()

    // If not on homepage, navigate to homepage first
    if (pathname !== "/") {
      router.push(`/#${targetId}`)
      return
    }

    // Smooth scroll to section
    const element = document.getElementById(targetId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
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

        <nav className="hidden items-center gap-8 md:flex">
          <a
            href="/#about"
            onClick={(e) => handleSmoothScroll(e, "about")}
            className="text-sm font-medium text-foreground/80 hover:text-foreground"
          >
            About
          </a>
          <a
            href="/#packages"
            onClick={(e) => handleSmoothScroll(e, "packages")}
            className="text-sm font-medium text-foreground/80 hover:text-foreground"
          >
            Membership
          </a>
          <Link href="/news" className="text-sm font-medium text-foreground/80 hover:text-foreground">
            News
          </Link>
          <a
            href="/#contact"
            onClick={(e) => handleSmoothScroll(e, "contact")}
            className="text-sm font-medium text-foreground/80 hover:text-foreground"
          >
            Contact
          </a>
          <a
            href="/#faq"
            onClick={(e) => handleSmoothScroll(e, "faq")}
            className="text-sm font-medium text-foreground/80 hover:text-foreground"
          >
            FAQ
          </a>
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
