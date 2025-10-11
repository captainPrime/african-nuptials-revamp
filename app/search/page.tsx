"use client"

import { useEffect, useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { Profile } from "@/lib/types/profile"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Heart, Grid3x3, List } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function SearchPage() {
    const [profiles, setProfiles] = useState<Profile[]>([])
    const [currentUser, setCurrentUser] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
    const [likedProfiles, setLikedProfiles] = useState<Set<string>>(new Set())
    const supabase = getSupabaseBrowserClient()
    const router = useRouter()
    const { toast } = useToast()

    useEffect(() => {
        const fetchProfiles = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser()

            if (user) {
                const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
                if (profile) {
                    setCurrentUser(profile)

                    // Fetch liked profiles
                    const { data: likes } = await supabase
                        .from("profile_likes")
                        .select("liked_profile_id")
                        .eq("liker_id", user.id)

                    if (likes) {
                        setLikedProfiles(new Set(likes.map((like: any) => like.liked_profile_id)))
                    }
                }
            }

            // Fetch all profiles (opposite gender if user is logged in)
            let query = supabase.from("profiles").select("*").order("created_at", { ascending: false })

            if (currentUser) {
                query = query.neq("id", currentUser.id).neq("gender", currentUser.gender)
            }

            const { data } = await query
            if (data) setProfiles(data)
            setLoading(false)
        }

        fetchProfiles()
    }, [supabase])

    const handleLike = async (profileId: string) => {
        if (!currentUser) {
            toast({
                title: "Login required",
                description: "Please login to like profiles",
                variant: "destructive",
            })
            return
        }

        const isLiked = likedProfiles.has(profileId)

        if (isLiked) {
            // Unlike
            const { error } = await supabase
                .from("profile_likes")
                .delete()
                .eq("liker_id", currentUser.id)
                .eq("liked_profile_id", profileId)

            if (!error) {
                setLikedProfiles((prev) => {
                    const newSet = new Set(prev)
                    newSet.delete(profileId)
                    return newSet
                })
                toast({
                    title: "Profile unliked",
                })
            }
        } else {
            // Like
            const { error } = await supabase.from("profile_likes").insert({
                liker_id: currentUser.id,
                liked_profile_id: profileId,
            })

            if (!error) {
                setLikedProfiles((prev) => new Set(prev).add(profileId))
                toast({
                    title: "Profile liked!",
                })
            }
        }
    }

    const handleSendInterest = async (profileId: string) => {
        if (!currentUser) {
            toast({
                title: "Login required",
                description: "Please login to send interest requests",
                variant: "destructive",
            })
            return
        }

        const { error } = await supabase.from("interest_requests").insert({
            sender_id: currentUser.id,
            receiver_id: profileId,
            status: "pending",
        })

        if (error) {
            if (error.code === "23505") {
                toast({
                    title: "Already sent",
                    description: "You have already sent an interest request to this profile",
                    variant: "destructive",
                })
            } else {
                toast({
                    title: "Error",
                    description: "Failed to send interest request",
                    variant: "destructive",
                })
            }
        } else {
            toast({
                title: "Interest sent!",
                description: "Your interest request has been sent successfully",
            })
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen flex-col">
            <Header onSignUpClick={() => { }} onLoginClick={() => { }} />

            <main className="flex-1 bg-secondary/30 py-8">
                <div className="container mx-auto px-4">
                    <div className="grid gap-6 lg:grid-cols-4">
                        {/* Filters Sidebar */}
                        <Card className="h-fit lg:col-span-1">
                            <CardContent className="space-y-6 p-6">
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Heart className="h-4 w-4" />I am looking for
                                    </Label>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="I'm looking for" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="woman">Woman</SelectItem>
                                            <SelectItem value="man">Man</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Age</Label>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select age" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="18-25">18-25</SelectItem>
                                            <SelectItem value="26-35">26-35</SelectItem>
                                            <SelectItem value="36-45">36-45</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Select Religion</Label>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Religion" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="christianity">Christianity</SelectItem>
                                            <SelectItem value="islam">Islam</SelectItem>
                                            <SelectItem value="traditional">Traditional</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Location</Label>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chennai" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="lagos">Lagos, Nigeria</SelectItem>
                                            <SelectItem value="accra">Accra, Ghana</SelectItem>
                                            <SelectItem value="nairobi">Nairobi, Kenya</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Availability</Label>
                                    <RadioGroup defaultValue="all">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="all" id="all" />
                                            <Label htmlFor="all" className="font-normal">
                                                All
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="available" id="available" />
                                            <Label htmlFor="available" className="font-normal">
                                                Available
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="offline" id="offline" />
                                            <Label htmlFor="offline" className="font-normal">
                                                Offline
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                <div className="space-y-2">
                                    <Label>Profile</Label>
                                    <RadioGroup defaultValue="all">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="all" id="profile-all" />
                                            <Label htmlFor="profile-all" className="font-normal">
                                                All
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="premium" id="premium" />
                                            <Label htmlFor="premium" className="font-normal">
                                                Premium
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Results */}
                        <div className="lg:col-span-3">
                            <div className="mb-6 flex items-center justify-between">
                                <h1 className="font-serif text-2xl font-semibold">Showing {profiles.length} profiles</h1>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <Label className="text-sm">Sort by:</Label>
                                        <Select defaultValue="relevant">
                                            <SelectTrigger className="w-40">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="relevant">Most relative</SelectItem>
                                                <SelectItem value="recent">Most recent</SelectItem>
                                                <SelectItem value="popular">Most popular</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button
                                            size="icon"
                                            variant={viewMode === "grid" ? "default" : "outline"}
                                            onClick={() => setViewMode("grid")}
                                        >
                                            <Grid3x3 className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant={viewMode === "list" ? "default" : "outline"}
                                            onClick={() => setViewMode("list")}
                                        >
                                            <List className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {viewMode === "grid" ? (
                                <div className="grid gap-6 sm:grid-cols-2">
                                    {profiles.map((profile) => {
                                        const age = profile.date_of_birth
                                            ? new Date().getFullYear() - new Date(profile.date_of_birth).getFullYear()
                                            : null
                                        const isLiked = likedProfiles.has(profile.id)

                                        return (
                                            <Card key={profile.id} className="overflow-hidden">
                                                <div className="relative">
                                                    <div className="relative aspect-[4/3]">
                                                        <img
                                                            src={profile.profile_photo || "/placeholder.svg"}
                                                            alt={profile.first_name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                        <div className="absolute left-3 top-3 flex gap-2">
                                                            <div className="h-3 w-3 rounded-full border-2 border-white bg-green-500" />
                                                        </div>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className={`absolute right-3 top-3 bg-white/80 hover:bg-white ${isLiked ? "text-red-500" : ""}`}
                                                            onClick={() => handleLike(profile.id)}
                                                        >
                                                            <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
                                                        </Button>
                                                        {profile.membership_plan !== "free" && (
                                                            <div className="absolute bottom-0 left-0 right-0 bg-green-500 py-1 text-center text-xs font-medium text-white">
                                                                Available Online
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <CardContent className="p-4">
                                                    <h3 className="mb-2 font-serif text-xl font-semibold">
                                                        {profile.first_name} {profile.last_name}
                                                    </h3>
                                                    <div className="mb-3 flex flex-wrap gap-2">
                                                        {profile.education && (
                                                            <Badge variant="secondary" className="bg-primary text-primary-foreground">
                                                                {profile.education}
                                                            </Badge>
                                                        )}
                                                        {profile.profession && (
                                                            <Badge variant="secondary" className="bg-primary text-primary-foreground">
                                                                {profile.profession}
                                                            </Badge>
                                                        )}
                                                        {age && (
                                                            <Badge variant="secondary" className="bg-primary text-primary-foreground">
                                                                {age} Years old
                                                            </Badge>
                                                        )}
                                                        {profile.height && (
                                                            <Badge variant="secondary" className="bg-primary text-primary-foreground">
                                                                Height: {profile.height}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        <Button size="sm" variant="outline" onClick={() => router.push(`/profile/${profile.id}`)}>
                                                            Chat now
                                                        </Button>
                                                        <Button size="sm" onClick={() => handleSendInterest(profile.id)}>
                                                            Send interest
                                                        </Button>
                                                        <Button size="sm" variant="outline" onClick={() => router.push(`/profile/${profile.id}`)}>
                                                            More details
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {profiles.map((profile) => {
                                        const age = profile.date_of_birth
                                            ? new Date().getFullYear() - new Date(profile.date_of_birth).getFullYear()
                                            : null
                                        const isLiked = likedProfiles.has(profile.id)

                                        return (
                                            <Card key={profile.id} className="overflow-hidden">
                                                <CardContent className="flex gap-4 p-4">
                                                    <div className="relative h-48 w-48 flex-shrink-0">
                                                        <img
                                                            src={profile.profile_photo || "/placeholder.svg"}
                                                            alt={profile.first_name}
                                                            className="h-full w-full rounded-lg object-cover"
                                                        />
                                                        <div className="absolute left-3 top-3 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
                                                        {profile.membership_plan !== "free" && (
                                                            <div className="absolute bottom-0 left-0 right-0 rounded-b-lg bg-green-500 py-1 text-center text-xs font-medium text-white">
                                                                Available Online
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-1 flex-col">
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <h3 className="mb-2 font-serif text-xl font-semibold">
                                                                    {profile.first_name} {profile.last_name}
                                                                </h3>
                                                                <div className="mb-3 flex flex-wrap gap-2">
                                                                    {profile.education && (
                                                                        <Badge variant="secondary" className="bg-primary text-primary-foreground">
                                                                            {profile.education}
                                                                        </Badge>
                                                                    )}
                                                                    {profile.profession && (
                                                                        <Badge variant="secondary" className="bg-primary text-primary-foreground">
                                                                            {profile.profession}
                                                                        </Badge>
                                                                    )}
                                                                    {age && (
                                                                        <Badge variant="secondary" className="bg-primary text-primary-foreground">
                                                                            {age} Years old
                                                                        </Badge>
                                                                    )}
                                                                    {profile.height && (
                                                                        <Badge variant="secondary" className="bg-primary text-primary-foreground">
                                                                            Height: {profile.height}
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className={isLiked ? "text-red-500" : ""}
                                                                onClick={() => handleLike(profile.id)}
                                                            >
                                                                <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
                                                            </Button>
                                                        </div>
                                                        <div className="mt-auto flex flex-wrap gap-2">
                                                            <Button size="sm" variant="outline" onClick={() => router.push(`/profile/${profile.id}`)}>
                                                                Chat now
                                                            </Button>
                                                            <Button size="sm" onClick={() => handleSendInterest(profile.id)}>
                                                                Send interest
                                                            </Button>
                                                            <Button size="sm" variant="outline" onClick={() => router.push(`/profile/${profile.id}`)}>
                                                                More details
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
