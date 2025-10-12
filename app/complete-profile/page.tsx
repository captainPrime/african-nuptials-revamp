"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import type { ProfileCreatedFor, Gender } from "@/lib/types/profile"
import { ChevronLeft, Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

type ProfileStep = "profile-for" | "name-dob" | "details"

export default function CompleteProfilePage() {
  const [step, setStep] = useState<ProfileStep>("profile-for")
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [databaseError, setDatabaseError] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  // Form state
  const [profileCreatedFor, setProfileCreatedFor] = useState<ProfileCreatedFor>("myself")
  const [gender, setGender] = useState<Gender>("male")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [day, setDay] = useState("")
  const [month, setMonth] = useState("")
  const [year, setYear] = useState("")
  const [religion, setReligion] = useState("")
  const [community, setCommunity] = useState("")
  const [livingIn, setLivingIn] = useState("")

  // Check if user is authenticated
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign up first to complete your profile",
          variant: "destructive",
        })
        router.push("/")
        return
      }

      try {
        const { data: profile, error } = await supabase.from("profiles").select("id").eq("id", user.id).single()

        if (error && error.code === "PGRST205") {
          setDatabaseError(true)
          setCheckingAuth(false)
          return
        }

        if (profile) {
          router.push("/dashboard")
          return
        }
      } catch (error) {
        console.error("[v0] Error checking profile:", error)
      }

      setCheckingAuth(false)
    }

    checkUser()
  }, [supabase, router, toast])

  const handleBack = () => {
    if (step === "name-dob") setStep("profile-for")
    else if (step === "details") setStep("name-dob")
  }

  const handleProfileForSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStep("name-dob")
  }

  const handleNameDobSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!firstName || !lastName || !day || !month || !year) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }
    setStep("details")
  }

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!religion || !community || !livingIn) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("No authenticated user found")
      }

      const dateOfBirth = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`

      const { error: profileError } = await supabase.from("profiles").insert({
        id: user.id,
        email: user.email!,
        phone: user.user_metadata?.phone || "",
        first_name: firstName,
        last_name: lastName,
        gender,
        date_of_birth: dateOfBirth,
        profile_created_for: profileCreatedFor,
        religion,
        community,
        living_in: livingIn,
        profile_completion: 30,
      })

      if (profileError) {
        if (profileError.code === "PGRST205") {
          setDatabaseError(true)
          throw new Error(
            "Database tables are not set up. Please run the SQL scripts from the scripts folder in your Supabase SQL editor.",
          )
        }
        throw profileError
      }

      toast({
        title: "Profile created successfully!",
        description: "Welcome to African Nuptials",
      })

      router.push("/dashboard")
    } catch (error: any) {
      console.error("[v0] Profile creation error:", error)
      toast({
        title: "Profile creation failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (databaseError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-2xl space-y-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Database Not Set Up</AlertTitle>
            <AlertDescription className="mt-2 space-y-2">
              <p>The database tables have not been created yet. Please follow these steps:</p>
              <ol className="ml-4 list-decimal space-y-1">
                <li>Go to your Supabase project dashboard</li>
                <li>Navigate to the SQL Editor</li>
                <li>
                  Run the SQL scripts from the <code className="rounded bg-muted px-1 py-0.5">scripts</code> folder in
                  this order:
                  <ul className="ml-4 mt-1 list-disc">
                    <li>01-create-profiles-table.sql</li>
                    <li>02-create-profile-views-table.sql</li>
                    <li>03-create-likes-table.sql</li>
                  </ul>
                </li>
                <li>After running the scripts, refresh this page</li>
              </ol>
            </AlertDescription>
          </Alert>
          <div className="flex gap-4">
            <Button onClick={() => router.push("/")} variant="outline">
              Go to Home
            </Button>
            <Button onClick={() => window.location.reload()}>Refresh Page</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-card p-8 shadow-xl">
        {step !== "profile-for" && (
          <button
            onClick={handleBack}
            className="absolute left-4 top-4 rounded-full p-2 hover:bg-muted"
            aria-label="Back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        <div className="space-y-6">
          {/* Step 1: Profile Created For */}
          {step === "profile-for" && (
            <form onSubmit={handleProfileForSubmit} className="space-y-6">
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
                      d="M20 20C23.3137 20 26 17.3137 26 14C26 10.6863 23.3137 8 20 8C16.6863 8 14 10.6863 14 14C14 17.3137 16.6863 20 20 20Z"
                      fill="currentColor"
                    />
                    <path d="M20 22C14.4772 22 10 26.4772 10 32H30C30 26.4772 25.5228 22 20 22Z" fill="currentColor" />
                    <circle cx="30" cy="10" r="4" fill="currentColor" />
                  </svg>
                </div>
                <h2 className="text-center font-serif text-xl font-semibold">This Profile is created for</h2>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "myself", label: "Myself" },
                  { value: "my_son", label: "My Son" },
                  { value: "my_daughter", label: "My Daughter" },
                  { value: "my_brother", label: "My Brother" },
                  { value: "my_sister", label: "My Sister" },
                  { value: "my_friend", label: "My Friend" },
                  { value: "my_relative", label: "My Relative" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setProfileCreatedFor(option.value as ProfileCreatedFor)}
                    className={`flex items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-medium transition-colors ${
                      profileCreatedFor === option.value
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background hover:border-primary/50"
                    }`}
                  >
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                        profileCreatedFor === option.value ? "border-primary-foreground" : "border-border"
                      }`}
                    >
                      {profileCreatedFor === option.value && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M10 3L4.5 8.5L2 6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                    {option.label}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                <Label>Gender</Label>
                <div className="flex gap-3">
                  {[
                    { value: "male", label: "Male" },
                    { value: "female", label: "Female" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setGender(option.value as Gender)}
                      className={`flex flex-1 items-center justify-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-medium transition-colors ${
                        gender === option.value
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background hover:border-primary/50"
                      }`}
                    >
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                          gender === option.value ? "border-primary-foreground" : "border-border"
                        }`}
                      >
                        {gender === option.value && <div className="h-2.5 w-2.5 rounded-full bg-current" />}
                      </div>
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                Continue
              </Button>
            </form>
          )}

          {/* Step 2: Name & Date of Birth */}
          {step === "name-dob" && (
            <form onSubmit={handleNameDobSubmit} className="space-y-6">
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
                      d="M20 20C23.3137 20 26 17.3137 26 14C26 10.6863 23.3137 8 20 8C16.6863 8 14 10.6863 14 14C14 17.3137 16.6863 20 20 20Z"
                      fill="currentColor"
                    />
                    <path d="M20 22C14.4772 22 10 26.4772 10 32H30C30 26.4772 25.5228 22 20 22Z" fill="currentColor" />
                    <circle cx="30" cy="10" r="4" fill="currentColor" />
                  </svg>
                </div>
                <h2 className="text-center font-serif text-xl font-semibold">
                  {gender === "male" ? "His" : "Her"} name
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Date of birth</Label>
                <div className="grid grid-cols-3 gap-3">
                  <Select value={day} onValueChange={setDay} required>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Day" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                        <SelectItem key={d} value={d.toString()}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={month} onValueChange={setMonth} required>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "January",
                        "February",
                        "March",
                        "April",
                        "May",
                        "June",
                        "July",
                        "August",
                        "September",
                        "October",
                        "November",
                        "December",
                      ].map((m, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={year} onValueChange={setYear} required>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 80 }, (_, i) => new Date().getFullYear() - 18 - i).map((y) => (
                        <SelectItem key={y} value={y.toString()}>
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                Continue
              </Button>
            </form>
          )}

          {/* Step 3: Religion, Community & Location */}
          {step === "details" && (
            <form onSubmit={handleFinalSubmit} className="space-y-6">
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
                      d="M20 20C23.3137 20 26 17.3137 26 14C26 10.6863 23.3137 8 20 8C16.6863 8 14 10.6863 14 14C14 17.3137 16.6863 20 20 20Z"
                      fill="currentColor"
                    />
                    <path d="M20 22C14.4772 22 10 26.4772 10 32H30C30 26.4772 25.5228 22 20 22Z" fill="currentColor" />
                    <circle cx="30" cy="10" r="4" fill="currentColor" />
                  </svg>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="religion">{gender === "male" ? "His" : "Her"} religion</Label>
                  <Select value={religion} onValueChange={setReligion} required>
                    <SelectTrigger id="religion" className="w-full">
                      <SelectValue placeholder="Please Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="christianity">Christianity</SelectItem>
                      <SelectItem value="islam">Islam</SelectItem>
                      <SelectItem value="traditional">Traditional</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="community">Community</Label>
                  <Select value={community} onValueChange={setCommunity} required>
                    <SelectTrigger id="community" className="w-full">
                      <SelectValue placeholder="Please Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yoruba">Yoruba</SelectItem>
                      <SelectItem value="igbo">Igbo</SelectItem>
                      <SelectItem value="hausa">Hausa</SelectItem>
                      <SelectItem value="akan">Akan</SelectItem>
                      <SelectItem value="zulu">Zulu</SelectItem>
                      <SelectItem value="amhara">Amhara</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="livingIn">Living in</Label>
                  <Select value={livingIn} onValueChange={setLivingIn} required>
                    <SelectTrigger id="livingIn" className="w-full">
                      <SelectValue placeholder="Please Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nigeria">Nigeria</SelectItem>
                      <SelectItem value="ghana">Ghana</SelectItem>
                      <SelectItem value="kenya">Kenya</SelectItem>
                      <SelectItem value="south-africa">South Africa</SelectItem>
                      <SelectItem value="ethiopia">Ethiopia</SelectItem>
                      <SelectItem value="egypt">Egypt</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {loading ? "Creating profile..." : "Complete Profile"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
