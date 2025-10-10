"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"

export function LoginModal({
  onClose,
  onForgotPassword,
}: {
  onClose: () => void
  onForgotPassword: () => void
}) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        })
        onClose()
        router.push("/dashboard")
        router.refresh()
      }
    } catch (error: any) {
      console.error("[v0] Login error:", error)
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-card p-8 shadow-xl">
        <button onClick={onClose} className="absolute right-4 top-4 rounded-full p-2 hover:bg-muted" aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
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
            <div className="text-center">
              <h2 className="font-serif text-2xl font-semibold">Hey there, welcome back!</h2>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {loading ? "Logging in..." : "Continue"}
          </Button>

          <div className="text-center">
            <button type="button" onClick={onForgotPassword} className="text-sm text-primary hover:underline">
              Forgot password?
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
