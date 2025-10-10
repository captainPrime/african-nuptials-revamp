"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import Link from "next/link"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()
  const router = useRouter()

  useEffect(() => {
    // Check if user has a valid session from the reset link
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        toast({
          title: "Invalid or expired link",
          description: "Please request a new password reset link.",
          variant: "destructive",
        })
        router.push("/")
      }
    })
  }, [supabase, router, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!password || !confirmPassword) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are the same",
        variant: "destructive",
      })
      return
    }

    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) throw error

      setSuccess(true)
      toast({
        title: "Password updated!",
        description: "Your password has been successfully reset.",
      })

      // Redirect to home after 2 seconds
      setTimeout(() => {
        router.push("/")
      }, 2000)
    } catch (error: any) {
      console.error("[v0] Password update error:", error)
      toast({
        title: "Failed to update password",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-secondary via-background to-accent/20 p-4">
      <div className="w-full max-w-md rounded-2xl bg-card p-8 shadow-xl">
        {!success ? (
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
                <h1 className="font-serif text-2xl font-semibold">Reset your password</h1>
                <p className="mt-2 text-sm text-muted-foreground">Enter your new password below</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? "Updating..." : "Update Password"}
            </Button>

            <div className="text-center">
              <Link href="/" className="text-sm text-primary hover:underline">
                Back to home
              </Link>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 40 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-primary-foreground"
                >
                  <path
                    d="M16.6667 20L18.3333 21.6667L23.3333 16.6667M33.3333 20C33.3333 27.3638 27.3638 33.3333 20 33.3333C12.6362 33.3333 6.66667 27.3638 6.66667 20C6.66667 12.6362 12.6362 6.66667 20 6.66667C27.3638 6.66667 33.3333 12.6362 33.3333 20Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="text-center">
                <h2 className="font-serif text-2xl font-semibold">Password updated!</h2>
                <p className="mt-2 text-sm text-muted-foreground">Your password has been successfully reset.</p>
                <p className="mt-1 text-sm text-muted-foreground">Redirecting to home...</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
