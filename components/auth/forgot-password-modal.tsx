"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { ChevronLeft, Mail } from "lucide-react"

export function ForgotPasswordModal({ onClose, onBack }: { onClose: () => void; onBack: () => void }) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast({
        title: "Missing information",
        description: "Please enter your email address",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error

      setSent(true)
      toast({
        title: "Reset link sent!",
        description: "Please check your email for the password reset link.",
      })
    } catch (error: any) {
      console.error("[v0] Password reset error:", error)
      toast({
        title: "Failed to send reset link",
        description: error.message || "Something went wrong. Please try again.",
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

        <button onClick={onBack} className="absolute left-4 top-4 rounded-full p-2 hover:bg-muted" aria-label="Back">
          <ChevronLeft className="h-5 w-5" />
        </button>

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary">
                <Mail className="h-10 w-10 text-primary-foreground" />
              </div>
              <div className="text-center">
                <h2 className="font-serif text-2xl font-semibold">Forgot your password?</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reset-email">Email address</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
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
                <h2 className="font-serif text-2xl font-semibold">Check your email</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  We've sent a password reset link to <strong>{email}</strong>
                </p>
              </div>
            </div>

            <Button onClick={onClose} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              Done
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
