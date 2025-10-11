"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { Profile } from "@/lib/types/profile"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { ProfilePhotoUpload } from "@/components/profile-photo-upload"
import { PhotoUpload } from "@/components/photo-upload"

export default function EditProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = getSupabaseBrowserClient()
  const { toast } = useToast()
  const router = useRouter()

  // Form state
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    date_of_birth: "",
    religion: "",
    community: "",
    living_in: "",
    height: "",
    weight: "",
    body_type: "",
    complexion: "",
    education: "",
    profession: "",
    company: "",
    annual_income: "",
    father_name: "",
    mother_name: "",
    siblings: "",
    family_type: "",
    family_status: "",
    diet: "",
    smoking: "",
    drinking: "",
    about_me: "",
    partner_expectations: "",
    facebook_url: "",
    twitter_url: "",
    instagram_url: "",
    linkedin_url: "",
  })

  const [profilePhoto, setProfilePhoto] = useState<string>("")
  const [coverPhoto, setCoverPhoto] = useState<string>("")
  const [photoGallery, setPhotoGallery] = useState<string[]>([])
  const [hobbies, setHobbies] = useState<string[]>([])
  const [newHobby, setNewHobby] = useState("")

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()
        if (data) {
          setProfile(data)
          setFormData({
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            phone: data.phone || "",
            date_of_birth: data.date_of_birth || "",
            religion: data.religion || "",
            community: data.community || "",
            living_in: data.living_in || "",
            height: data.height || "",
            weight: data.weight || "",
            body_type: data.body_type || "",
            complexion: data.complexion || "",
            education: data.education || "",
            profession: data.profession || "",
            company: data.company || "",
            annual_income: data.annual_income || "",
            father_name: data.father_name || "",
            mother_name: data.mother_name || "",
            siblings: data.siblings || "",
            family_type: data.family_type || "",
            family_status: data.family_status || "",
            diet: data.diet || "",
            smoking: data.smoking || "",
            drinking: data.drinking || "",
            about_me: data.about_me || "",
            partner_expectations: data.partner_expectations || "",
            facebook_url: data.facebook_url || "",
            twitter_url: data.twitter_url || "",
            instagram_url: data.instagram_url || "",
            linkedin_url: data.linkedin_url || "",
          })
          setProfilePhoto(data.profile_photo || "")
          setCoverPhoto(data.cover_photo || "")
          setPhotoGallery(data.photo_gallery || [])
          setHobbies(data.hobbies || [])
        }
      }
      setLoading(false)
    }
    fetchProfile()
  }, [supabase])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAddHobby = () => {
    if (newHobby.trim() && !hobbies.includes(newHobby.trim())) {
      setHobbies([...hobbies, newHobby.trim()])
      setNewHobby("")
    }
  }

  const handleRemoveHobby = (hobby: string) => {
    setHobbies(hobbies.filter((h) => h !== hobby))
  }

  const handleProfilePhotoUpload = (url: string) => {
    setProfilePhoto(url)
  }

  const handleCoverPhotoUpload = (url: string) => {
    setCoverPhoto(url)
  }

  const handleGalleryPhotoUpload = (url: string) => {
    setPhotoGallery((prev) => [...prev, url])
  }

  const calculateProfileCompletion = () => {
    const fields = [
      formData.first_name,
      formData.last_name,
      formData.phone,
      formData.date_of_birth,
      formData.religion,
      formData.community,
      formData.living_in,
      formData.height,
      formData.education,
      formData.profession,
      formData.about_me,
      profilePhoto,
      hobbies.length > 0,
      photoGallery.length > 0,
    ]
    const filledFields = fields.filter((field) => field).length
    return Math.round((filledFields / fields.length) * 100)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const profileCompletion = calculateProfileCompletion()

      const { error } = await supabase
        .from("profiles")
        .update({
          ...formData,
          profile_photo: profilePhoto,
          cover_photo: coverPhoto,
          photo_gallery: photoGallery,
          hobbies,
          profile_completion: profileCompletion,
        })
        .eq("id", user.id)

      if (error) throw error

      toast({
        title: "Profile updated!",
        description: "Your profile has been successfully updated.",
      })

      router.push("/dashboard/profile")
    } catch (error: any) {
      console.error("[v0] Profile update error:", error)
      toast({
        title: "Update failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-6">
      {/* Profile Photo */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Photo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <ProfilePhotoUpload
              currentPhoto={profilePhoto}
              onUploadComplete={handleProfilePhotoUpload}
              initials={`${formData.first_name?.[0] || ""}${formData.last_name?.[0] || ""}`}
            />
            <div>
              <p className="text-sm font-medium">Upload a new photo</p>
              <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max size 2MB</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cover Photo */}
      <Card>
        <CardHeader>
          <CardTitle>Cover Photo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {coverPhoto ? (
              <div className="relative h-48 w-full overflow-hidden rounded-lg">
                <img src={coverPhoto || "/placeholder.svg"} alt="Cover" className="h-full w-full object-cover" />
              </div>
            ) : (
              <div className="flex h-48 w-full items-center justify-center rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">No cover photo</p>
              </div>
            )}
            <ProfilePhotoUpload
              currentPhoto={coverPhoto}
              onUploadComplete={handleCoverPhotoUpload}
              initials=""
              buttonText="Upload Cover Photo"
            />
            <p className="text-xs text-muted-foreground">Recommended size: 1200x400px. Max size 2MB</p>
          </div>
        </CardContent>
      </Card>

      {/* Photo Gallery */}
      <Card>
        <CardHeader>
          <CardTitle>Photo Gallery</CardTitle>
        </CardHeader>
        <CardContent>
          <PhotoUpload currentPhotos={photoGallery} onUploadComplete={handleGalleryPhotoUpload} maxFiles={6} />
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => handleInputChange("first_name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => handleInputChange("last_name", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Date of Birth *</Label>
              <Input
                id="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => handleInputChange("date_of_birth", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="religion">Religion *</Label>
              <Select value={formData.religion} onValueChange={(value) => handleInputChange("religion", value)}>
                <SelectTrigger id="religion" className="w-full">
                  <SelectValue placeholder="Select" />
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
              <Label htmlFor="community">Community *</Label>
              <Select value={formData.community} onValueChange={(value) => handleInputChange("community", value)}>
                <SelectTrigger id="community" className="w-full">
                  <SelectValue placeholder="Select" />
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
              <Label htmlFor="living_in">Living In *</Label>
              <Select value={formData.living_in} onValueChange={(value) => handleInputChange("living_in", value)}>
                <SelectTrigger id="living_in" className="w-full">
                  <SelectValue placeholder="Select" />
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
        </CardContent>
      </Card>

      {/* Physical Attributes */}
      <Card>
        <CardHeader>
          <CardTitle>Physical Attributes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="height">Height</Label>
              <Input
                id="height"
                placeholder="e.g., 5'8&quot;"
                value={formData.height}
                onChange={(e) => handleInputChange("height", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Weight</Label>
              <Input
                id="weight"
                placeholder="e.g., 70kg"
                value={formData.weight}
                onChange={(e) => handleInputChange("weight", e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="body_type">Body Type</Label>
              <Select value={formData.body_type} onValueChange={(value) => handleInputChange("body_type", value)}>
                <SelectTrigger id="body_type" className="w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="slim">Slim</SelectItem>
                  <SelectItem value="average">Average</SelectItem>
                  <SelectItem value="athletic">Athletic</SelectItem>
                  <SelectItem value="heavy">Heavy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="complexion">Complexion</Label>
              <Select value={formData.complexion} onValueChange={(value) => handleInputChange("complexion", value)}>
                <SelectTrigger id="complexion" className="w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Professional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="education">Education</Label>
              <Select value={formData.education} onValueChange={(value) => handleInputChange("education", value)}>
                <SelectTrigger id="education" className="w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high-school">High School</SelectItem>
                  <SelectItem value="associate">Associate Degree</SelectItem>
                  <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                  <SelectItem value="master">Master's Degree</SelectItem>
                  <SelectItem value="doctorate">Doctorate/PhD</SelectItem>
                  <SelectItem value="diploma">Diploma</SelectItem>
                  <SelectItem value="certificate">Certificate</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="profession">Profession</Label>
              <Input
                id="profession"
                placeholder="e.g., Software Engineer"
                value={formData.profession}
                onChange={(e) => handleInputChange("profession", e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                placeholder="e.g., Tech Corp"
                value={formData.company}
                onChange={(e) => handleInputChange("company", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="annual_income">Annual Income</Label>
              <Input
                id="annual_income"
                placeholder="e.g., $50,000"
                value={formData.annual_income}
                onChange={(e) => handleInputChange("annual_income", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Family Information */}
      <Card>
        <CardHeader>
          <CardTitle>Family Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="father_name">Father's Name</Label>
              <Input
                id="father_name"
                value={formData.father_name}
                onChange={(e) => handleInputChange("father_name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mother_name">Mother's Name</Label>
              <Input
                id="mother_name"
                value={formData.mother_name}
                onChange={(e) => handleInputChange("mother_name", e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="siblings">Siblings</Label>
              <Input
                id="siblings"
                placeholder="e.g., 2 brothers, 1 sister"
                value={formData.siblings}
                onChange={(e) => handleInputChange("siblings", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="family_type">Family Type</Label>
              <Select value={formData.family_type} onValueChange={(value) => handleInputChange("family_type", value)}>
                <SelectTrigger id="family_type" className="w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nuclear">Nuclear</SelectItem>
                  <SelectItem value="joint">Joint</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="family_status">Family Status</Label>
              <Select
                value={formData.family_status}
                onValueChange={(value) => handleInputChange("family_status", value)}
              >
                <SelectTrigger id="family_status" className="w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="middle-class">Middle Class</SelectItem>
                  <SelectItem value="upper-middle-class">Upper Middle Class</SelectItem>
                  <SelectItem value="rich">Rich</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lifestyle */}
      <Card>
        <CardHeader>
          <CardTitle>Lifestyle</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="diet">Diet</Label>
              <Select value={formData.diet} onValueChange={(value) => handleInputChange("diet", value)}>
                <SelectTrigger id="diet" className="w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vegetarian">Vegetarian</SelectItem>
                  <SelectItem value="non-vegetarian">Non-Vegetarian</SelectItem>
                  <SelectItem value="vegan">Vegan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="smoking">Smoking</Label>
              <Select value={formData.smoking} onValueChange={(value) => handleInputChange("smoking", value)}>
                <SelectTrigger id="smoking" className="w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="occasionally">Occasionally</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="drinking">Drinking</Label>
              <Select value={formData.drinking} onValueChange={(value) => handleInputChange("drinking", value)}>
                <SelectTrigger id="drinking" className="w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="occasionally">Occasionally</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Hobbies</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a hobby"
                value={newHobby}
                onChange={(e) => setNewHobby(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddHobby())}
              />
              <Button type="button" onClick={handleAddHobby}>
                Add
              </Button>
            </div>
            {hobbies.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {hobbies.map((hobby) => (
                  <div key={hobby} className="flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-sm">
                    {hobby}
                    <button
                      type="button"
                      onClick={() => handleRemoveHobby(hobby)}
                      className="ml-1 text-muted-foreground hover:text-foreground"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* About & Expectations */}
      <Card>
        <CardHeader>
          <CardTitle>About & Partner Expectations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="about_me">About Me</Label>
            <Textarea
              id="about_me"
              placeholder="Tell us about yourself..."
              rows={4}
              value={formData.about_me}
              onChange={(e) => handleInputChange("about_me", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="partner_expectations">Partner Expectations</Label>
            <Textarea
              id="partner_expectations"
              placeholder="What are you looking for in a partner..."
              rows={4}
              value={formData.partner_expectations}
              onChange={(e) => handleInputChange("partner_expectations", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Social Media */}
      <Card>
        <CardHeader>
          <CardTitle>Social Media</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="facebook_url">Facebook URL</Label>
              <Input
                id="facebook_url"
                type="url"
                placeholder="https://facebook.com/..."
                value={formData.facebook_url}
                onChange={(e) => handleInputChange("facebook_url", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twitter_url">Twitter URL</Label>
              <Input
                id="twitter_url"
                type="url"
                placeholder="https://twitter.com/..."
                value={formData.twitter_url}
                onChange={(e) => handleInputChange("twitter_url", e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="instagram_url">Instagram URL</Label>
              <Input
                id="instagram_url"
                type="url"
                placeholder="https://instagram.com/..."
                value={formData.instagram_url}
                onChange={(e) => handleInputChange("instagram_url", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin_url">LinkedIn URL</Label>
              <Input
                id="linkedin_url"
                type="url"
                placeholder="https://linkedin.com/in/..."
                value={formData.linkedin_url}
                onChange={(e) => handleInputChange("linkedin_url", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  )
}
