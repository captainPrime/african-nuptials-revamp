"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

export function HeroSearch() {
  const [lookingFor, setLookingFor] = useState("woman")
  const [ageFrom, setAgeFrom] = useState("22")
  const [ageTo, setAgeTo] = useState("36")
  const [religion, setReligion] = useState("")
  const [location, setLocation] = useState("")
  const [showLoginModal, setShowLoginModal] = useState(false)
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  const handleSearch = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      // Trigger login modal
      window.dispatchEvent(new CustomEvent("show-login-modal"))
      return
    }

    const params = new URLSearchParams()
    if (lookingFor) params.set("gender", lookingFor)
    if (ageFrom) params.set("ageMin", ageFrom)
    if (ageTo) params.set("ageMax", ageTo)
    if (religion) params.set("religion", religion)
    if (location) params.set("location", location)

    router.push(`/search?${params.toString()}`)
  }

  return (
    <div className="w-full max-w-4xl rounded-2xl bg-card p-6 shadow-lg">
      <div className="mb-6 flex gap-4 border-b border-border">
        <button
          className={`pb-3 text-sm font-medium ${
            true ? "border-b-2 border-primary text-primary" : "text-muted-foreground"
          }`}
        >
          Advance Search
        </button>
        <button className="pb-3 text-sm font-medium text-muted-foreground">Profile ID Search</button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-primary"
            >
              <path
                d="M8 8C9.65685 8 11 6.65685 11 5C11 3.34315 9.65685 2 8 2C6.34315 2 5 3.34315 5 5C5 6.65685 6.34315 8 8 8Z"
                fill="currentColor"
              />
              <path d="M8 9C5.23858 9 3 11.2386 3 14H13C13 11.2386 10.7614 9 8 9Z" fill="currentColor" />
            </svg>
            I'm looking for a
          </label>
          <Select value={lookingFor} onValueChange={setLookingFor}>
            <SelectTrigger className="w-full text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="text-foreground">
              <SelectItem value="woman">Woman</SelectItem>
              <SelectItem value="man">Man</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-primary"
            >
              <rect x="3" y="2" width="10" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <line x1="3" y1="5" x2="13" y2="5" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            aged
          </label>
          <div className="flex items-center gap-2">
            <Select value={ageFrom} onValueChange={setAgeFrom}>
              <SelectTrigger className="w-full text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="text-foreground">
                {Array.from({ length: 63 }, (_, i) => i + 18).map((age) => (
                  <SelectItem key={age} value={age.toString()}>
                    {age}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">to</span>
            <Select value={ageTo} onValueChange={setAgeTo}>
              <SelectTrigger className="w-full text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="text-foreground">
                {Array.from({ length: 63 }, (_, i) => i + 18).map((age) => (
                  <SelectItem key={age} value={age.toString()}>
                    {age}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-primary"
            >
              <path d="M8 2L9.5 6H13.5L10.5 8.5L11.5 12.5L8 10L4.5 12.5L5.5 8.5L2.5 6H6.5L8 2Z" fill="currentColor" />
            </svg>
            of religion
          </label>
          <Select value={religion} onValueChange={setReligion}>
            <SelectTrigger className="w-full text-foreground">
              <SelectValue placeholder="Please select" />
            </SelectTrigger>
            <SelectContent className="text-foreground">
              <SelectItem value="christianity">Christianity</SelectItem>
              <SelectItem value="islam">Islam</SelectItem>
              <SelectItem value="traditional">Traditional</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-primary"
            >
              <path
                d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
              />
              <path d="M8 2C10 4 11 6 11 8C11 10 10 12 8 14C6 12 5 10 5 8C5 6 6 4 8 2Z" fill="currentColor" />
            </svg>
            and living in
          </label>
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger className="w-full text-foreground">
              <SelectValue placeholder="Please select" />
            </SelectTrigger>
            <SelectContent className="text-foreground">
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

      <div className="mt-6 flex justify-center">
        <Button
          onClick={handleSearch}
          size="lg"
          className="gap-2 bg-primary px-12 text-primary-foreground hover:bg-primary/90"
        >
          <Search className="h-5 w-5" />
          Search
        </Button>
      </div>

      <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <div className="flex -space-x-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 w-8 overflow-hidden rounded-full border-2 border-background">
              <img
                src={`/diverse-group.png?height=32&width=32&query=person ${i}`}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
        <span>
          <strong className="font-semibold text-foreground">16 People</strong> found love in the last 12 days
        </span>
      </div>
    </div>
  )
}
