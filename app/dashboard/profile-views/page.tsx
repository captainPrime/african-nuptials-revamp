"use client"

import { useEffect, useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { Profile } from "@/lib/types/profile"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Pagination } from "@/components/ui/pagination"
import { Eye, MapPin, Briefcase } from "lucide-react"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"

interface ProfileView {
  id: string
  viewed_at: string
  viewer: Profile
}

const ITEMS_PER_PAGE = 10

export default function ProfileViewsPage() {
  const [views, setViews] = useState<ProfileView[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<Profile | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalViews, setTotalViews] = useState(0)
  const supabase = getSupabaseBrowserClient()
  const router = useRouter()

  useEffect(() => {
    fetchProfileViews()
  }, [currentPage])

  const fetchProfileViews = async () => {
    setLoading(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/")
      return
    }

    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
    if (profile) setCurrentUser(profile)

    const offset = (currentPage - 1) * ITEMS_PER_PAGE

    const {
      data: viewsData,
      error,
      count,
    } = await supabase
      .from("profile_views")
      .select(
        `
          id,
          viewed_at,
          viewer:viewer_id (
            id,
            first_name,
            last_name,
            profile_photo,
            living_in,
            profession,
            date_of_birth,
            gender,
            is_verified
          )
        `,
        { count: "exact" },
      )
      .eq("profile_id", user.id)
      .order("viewed_at", { ascending: false })
      .range(offset, offset + ITEMS_PER_PAGE - 1)

    if (error) {
      console.error("[v0] Error fetching profile views:", error)
    } else if (viewsData) {
      const validViews = viewsData.filter((view: any) => view.viewer !== null) as ProfileView[]
      setViews(validViews)
      setTotalViews(count || 0)
    }

    setLoading(false)
  }

  const calculateAge = (dateOfBirth: string) => {
    return new Date().getFullYear() - new Date(dateOfBirth).getFullYear()
  }

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl p-3 sm:p-6">
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent className="space-y-4 p-4 sm:p-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  const totalPages = Math.ceil(totalViews / ITEMS_PER_PAGE)

  return (
    <div className="container mx-auto max-w-4xl p-3 sm:p-6">
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#551c22]">
              <Eye className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="font-serif text-2xl text-[#551c22]">Profile Views</CardTitle>
              <p className="text-sm text-muted-foreground">
                {totalViews} {totalViews === 1 ? "person has" : "people have"} viewed your profile
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {views.length === 0 ? (
            <div className="py-12 text-center">
              <Eye className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No profile views yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">When someone views your profile, they'll appear here</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {views.map((view) => {
                  const age = view.viewer.date_of_birth ? calculateAge(view.viewer.date_of_birth) : null

                  return (
                    <div
                      key={view.id}
                      className="flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-accent"
                      onClick={() => router.push(`/profile/${view.viewer.id}`)}
                    >
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={view.viewer.profile_photo || "/placeholder.svg"} />
                        <AvatarFallback className="bg-primary text-lg text-primary-foreground">
                          {view.viewer.first_name?.[0]}
                          {view.viewer.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">
                            {view.viewer.first_name} {view.viewer.last_name}
                          </h3>
                          {view.viewer.is_verified && <Badge className="bg-blue-100 text-blue-700">Verified</Badge>}
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          {age && <span>{age} years</span>}
                          {view.viewer.living_in && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {view.viewer.living_in}
                            </span>
                          )}
                          {view.viewer.profession && (
                            <span className="flex items-center gap-1">
                              <Briefcase className="h-3 w-3" />
                              {view.viewer.profession}
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-xs text-muted-foreground">
                          Viewed {formatDistanceToNow(new Date(view.viewed_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {totalPages > 1 && (
                <div className="mt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={ITEMS_PER_PAGE}
                    totalItems={totalViews}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
