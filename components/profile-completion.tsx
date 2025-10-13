"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, Heart, Eye, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Profile } from "@/lib/types/profile"

interface ProfileCompletionProps {
  profile: Profile
  likesCount: number
  viewsCount: number
  interestsCount: number
  showCompleteButton?: boolean
}

export function ProfileCompletion({
  profile,
  likesCount,
  viewsCount,
  interestsCount,
  showCompleteButton = true,
}: ProfileCompletionProps) {
  const router = useRouter()
  const completionPercentage = profile.profile_completion || 0

  const getCompletionStatus = () => {
    if (completionPercentage === 100) {
      return {
        label: "Completed",
        color: "bg-green-500",
        badgeClass: "bg-green-500 hover:bg-green-600 text-white",
        circleColor: "text-green-500",
        statusText: "Verified",
      }
    } else if (completionPercentage >= 50) {
      return {
        label: "Pending",
        color: "bg-orange-500",
        badgeClass: "bg-orange-500 hover:bg-orange-600 text-white",
        circleColor: "text-orange-500",
        statusText: "Pending",
      }
    } else {
      return {
        label: "Incomplete!",
        color: "bg-red-500",
        badgeClass: "bg-red-500 hover:bg-red-600 text-white",
        circleColor: "text-[#551c22]",
        statusText: "Complete",
      }
    }
  }

  const status = getCompletionStatus()

  const checklistItems = [
    {
      label: "Basic information",
      completed: !!(
        profile.first_name &&
        profile.last_name &&
        profile.date_of_birth &&
        profile.gender &&
        profile.living_in
      ),
      count:
        profile.first_name && profile.last_name && profile.date_of_birth && profile.gender && profile.living_in
          ? "5/5"
          : "3/5",
    },
    {
      label: "Profile photo",
      completed: !!profile.profile_photo,
      count: profile.profile_photo ? "1/1" : "0/1",
    },
    {
      label: "Socials",
      completed: !!(profile.about_me || profile.hobbies),
      count: profile.about_me && profile.hobbies ? "2/2" : profile.about_me || profile.hobbies ? "1/2" : "0/2",
    },
    {
      label: "More data",
      completed: !!(
        profile.education &&
        profile.profession &&
        profile.religion &&
        profile.height &&
        profile.weight &&
        profile.marital_status
      ),
      count:
        [
          profile.education,
          profile.profession,
          profile.religion,
          profile.height,
          profile.weight,
          profile.marital_status,
        ].filter(Boolean).length + "/6",
    },
  ]

  const circumference = 2 * Math.PI * 70
  const strokeDashoffset = circumference - (completionPercentage / 100) * circumference

  return (
    <Card className="border-none shadow-sm">
      <CardContent className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold text-[#551c22]">Profile completion</h2>
          <Badge className={status.badgeClass}>{status.label}</Badge>
        </div>

        <div className="mb-6 flex items-start gap-6">
          <div className="relative h-40 w-40 flex-shrink-0">
            <svg className="h-full w-full -rotate-90 transform">
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                className="text-muted/10"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className={`${status.circleColor} transition-all duration-500`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-serif text-5xl font-bold text-[#551c22]">{completionPercentage}%</span>
              <span className="text-sm text-muted-foreground">{status.statusText}</span>
            </div>
          </div>

          <div className="flex-1 space-y-3">
            {checklistItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-4 w-4 items-center justify-center rounded ${
                      item.completed ? "bg-[#551c22]" : "bg-muted"
                    }`}
                  >
                    {item.completed && <Check className="h-4 w-4 text-white" />}
                  </div>
                  <span className={`text-sm ${item.completed ? "text-[#551c22]" : "text-muted-foreground"}`}>
                    {item.label}
                  </span>
                </div>
                <span className="text-sm font-medium text-[#551c22]">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 border-t pt-6">
          <button
            onClick={() => router.push("/dashboard/profile")}
            className="flex items-center gap-2 rounded-lg bg-[#ffe2e5] p-3 transition-colors hover:bg-[#ffd6da]"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#551c22]">
              <Heart className="h-3 w-3 text-white" />
            </div>
            <div>
              <p className="text-xl font-bold text-[#551c22]">{likesCount}</p>
              <p className="text-xs text-[#551c22]/70">Likes</p>
            </div>
          </button>

          <button
            onClick={() => router.push("/dashboard/profile-views")}
            className="flex items-center gap-2 rounded-lg bg-[#ffe2e5] p-3 transition-colors hover:bg-[#ffd6da]"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#551c22]">
              <Eye className="h-3 w-3 text-white" />
            </div>
            <div>
              <p className="text-xl font-bold text-[#551c22]">{viewsCount}</p>
              <p className="text-xs text-[#551c22]/70">Views</p>
            </div>
          </button>

          <button
            onClick={() => router.push("/dashboard/interests")}
            className="flex items-center gap-2 rounded-lg bg-[#ffe2e5] p-3 transition-colors hover:bg-[#ffd6da]"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#551c22]">
              <Users className="h-3 w-3 text-white" />
            </div>
            <div>
              <p className="text-xl font-bold text-[#551c22]">{interestsCount}</p>
              <p className="text-xs text-[#551c22]/70">Interests</p>
            </div>
          </button>
        </div>

        {showCompleteButton && completionPercentage < 100 && (
          <Button
            className="mt-6 w-full bg-[#551c22] hover:bg-[#551c22]/90"
            onClick={() => router.push("/dashboard/profile/edit")}
          >
            Complete Profile
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
