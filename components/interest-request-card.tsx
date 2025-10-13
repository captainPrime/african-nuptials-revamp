"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MapPin, Briefcase, Ruler, X } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Profile } from "@/lib/types/profile"

interface InterestRequestCardProps {
  request: {
    id: string
    sender: Profile
    receiver?: Profile
    status: string
    created_at: string
    sender_id: string
    receiver_id: string
  }
  currentUserId: string
  isSent?: boolean
  onAccept?: (requestId: string) => void
  onDeny?: (requestId: string) => void
  onCancel?: (requestId: string) => void
  compact?: boolean
}

export function InterestRequestCard({
  request,
  currentUserId,
  isSent = false,
  onAccept,
  onDeny,
  onCancel,
  compact = false,
}: InterestRequestCardProps) {
  const router = useRouter()
  const profile = isSent ? request.receiver : request.sender

  if (!profile) return null

  const age = profile.date_of_birth ? new Date().getFullYear() - new Date(profile.date_of_birth).getFullYear() : null

  const isOwnSentRequest = isSent && request.sender_id === currentUserId
  const showActions = !isSent && request.status === "pending" && onAccept && onDeny

  return (
    <Card className="border shadow-sm">
      <CardContent className={`flex flex-col gap-4 ${compact ? "p-3 sm:p-4" : "p-4"} sm:flex-row sm:items-center`}>
        <Avatar className={`${compact ? "h-16 w-16" : "h-20 w-20"} border-2 border-primary/20 shrink-0`}>
          <AvatarImage src={profile.profile_photo || "/placeholder.svg"} />
          <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
            {profile.first_name?.[0]}
            {profile.last_name?.[0]}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className={`font-semibold text-foreground ${compact ? "text-sm" : "text-base"}`}>
              {profile.first_name} {profile.last_name}
            </h3>
            {isSent && (
              <Badge
                variant="secondary"
                className={`shrink-0 ${
                  request.status === "accepted"
                    ? "bg-green-100 text-green-700"
                    : request.status === "denied"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {request.status}
              </Badge>
            )}
            {!isSent && profile.membership_plan !== "free" && (
              <Badge variant="secondary" className="bg-primary/10 text-primary shrink-0 capitalize">
                {profile.membership_plan}
              </Badge>
            )}
          </div>

          <div
            className={`flex flex-wrap gap-2 ${compact ? "text-xs" : "text-xs sm:text-sm"} text-muted-foreground mb-3`}
          >
            {profile.living_in && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">City: {profile.living_in}</span>
              </span>
            )}
            {age && <span>Age: {age}</span>}
            {profile.height && (
              <span className="flex items-center gap-1">
                <Ruler className="h-3 w-3 shrink-0" />
                Height: {profile.height}
              </span>
            )}
            {profile.profession && (
              <span className="flex items-center gap-1">
                <Briefcase className="h-3 w-3 shrink-0" />
                <span className="truncate">Job: {profile.profession}</span>
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Button
              size="sm"
              variant="outline"
              className={`border-primary/20 bg-transparent w-full sm:w-auto ${compact ? "text-xs" : ""}`}
              onClick={(e) => {
                e.stopPropagation()
                router.push(`/profile/${profile.id}`)
              }}
            >
              View full profile
            </Button>
            <p className={`${compact ? "text-xs" : "text-xs"} text-muted-foreground`}>
              {isSent ? "Sent on" : "Request on"}: {new Date(request.created_at).toLocaleDateString()}
              {!compact && ` at ${new Date(request.created_at).toLocaleTimeString()}`}
            </p>
          </div>
        </div>

        {showActions && (
          <div className="flex gap-2 sm:flex-col shrink-0">
            <Button
              size="sm"
              className="bg-accent/50 text-primary hover:bg-accent flex-1 sm:flex-none"
              onClick={() => onAccept(request.id)}
            >
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-destructive/20 text-destructive hover:bg-destructive/10 bg-transparent flex-1 sm:flex-none"
              onClick={() => onDeny(request.id)}
            >
              Deny
            </Button>
          </div>
        )}

        {isSent && request.status === "pending" && isOwnSentRequest && onCancel && (
          <Button
            size="sm"
            variant="outline"
            className="border-destructive/20 text-destructive hover:bg-destructive/10 bg-transparent w-full sm:w-auto"
            onClick={() => onCancel(request.id)}
          >
            <X className="mr-1 h-4 w-4" />
            Cancel
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
