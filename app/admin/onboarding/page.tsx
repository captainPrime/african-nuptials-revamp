"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Shield } from "lucide-react"

export default function AdminOnboardingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [adminCode, setAdminCode] = useState("")
  const [hasAdmin, setHasAdmin] = useState(false)

  useEffect(() => {
    checkAdminStatus()
  }, [])

  async function checkAdminStatus() {
    try {
      const supabase = createClient()

      // Check if user is logged in
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }

      // Check if any admin exists
      const { data: admins } = await supabase.from("profiles").select("id").eq("role", "administrator").limit(1)

      if (admins && admins.length > 0) {
        setHasAdmin(true)
        // Check if current user is admin
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

        if (profile?.role === "administrator") {
          router.push("/admin")
        }
      }
    } catch (err) {
      console.error("Error checking admin status:", err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSetupAdmin(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSubmitting(true)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError("You must be logged in to set up admin")
        return
      }

      // Verify admin code (you can change this to your preferred code)
      if (adminCode !== "ADMIN2024") {
        setError("Invalid admin code")
        return
      }

      // Update user role to administrator
      const { error: updateError } = await supabase.from("profiles").update({ role: "administrator" }).eq("id", user.id)

      if (updateError) throw updateError

      router.push("/admin")
    } catch (err: any) {
      setError(err.message || "Failed to set up admin")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[#551c22]" />
      </div>
    )
  }

  if (hasAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Admin Already Exists
            </CardTitle>
            <CardDescription>An administrator has already been set up for this system.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/")} className="w-full">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-[#551c22] to-[#7c5055]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin Setup
          </CardTitle>
          <CardDescription>Set yourself as the system administrator</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSetupAdmin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="adminCode">Admin Code</Label>
              <Input
                id="adminCode"
                type="password"
                placeholder="Enter admin code"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                required
              />
              <p className="text-sm text-muted-foreground">Contact your system administrator for the admin code</p>
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting up...
                </>
              ) : (
                "Set Up Admin"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
