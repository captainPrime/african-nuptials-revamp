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
import { HOBBIES_LIST } from "@/lib/constants/hobbies"
import { MultiSelect } from "@/components/ui/multi-select"

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
      formData.weight,
      formData.body_type,
      formData.complexion,
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
              onUploadComplete={setProfilePhoto}
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
              onUploadComplete={setCoverPhoto}
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
          <PhotoUpload currentPhotos={photoGallery} onUploadComplete={setPhotoGallery} maxFiles={6} />
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
              <Select value={formData.height} onValueChange={(value) => handleInputChange("height", value)}>
                <SelectTrigger id="height" className="w-full">
                  <SelectValue placeholder="Select height" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4'0&quot; (122cm)">4'0" (122cm)</SelectItem>
                  <SelectItem value="4'1&quot; (124cm)">4'1" (124cm)</SelectItem>
                  <SelectItem value="4'2&quot; (127cm)">4'2" (127cm)</SelectItem>
                  <SelectItem value="4'3&quot; (130cm)">4'3" (130cm)</SelectItem>
                  <SelectItem value="4'4&quot; (132cm)">4'4" (132cm)</SelectItem>
                  <SelectItem value="4'5&quot; (135cm)">4'5" (135cm)</SelectItem>
                  <SelectItem value="4'6&quot; (137cm)">4'6" (137cm)</SelectItem>
                  <SelectItem value="4'7&quot; (140cm)">4'7" (140cm)</SelectItem>
                  <SelectItem value="4'8&quot; (142cm)">4'8" (142cm)</SelectItem>
                  <SelectItem value="4'9&quot; (145cm)">4'9" (145cm)</SelectItem>
                  <SelectItem value="4'10&quot; (147cm)">4'10" (147cm)</SelectItem>
                  <SelectItem value="4'11&quot; (150cm)">4'11" (150cm)</SelectItem>
                  <SelectItem value="5'0&quot; (152cm)">5'0" (152cm)</SelectItem>
                  <SelectItem value="5'1&quot; (155cm)">5'1" (155cm)</SelectItem>
                  <SelectItem value="5'2&quot; (157cm)">5'2" (157cm)</SelectItem>
                  <SelectItem value="5'3&quot; (160cm)">5'3" (160cm)</SelectItem>
                  <SelectItem value="5'4&quot; (163cm)">5'4" (163cm)</SelectItem>
                  <SelectItem value="5'5&quot; (165cm)">5'5" (165cm)</SelectItem>
                  <SelectItem value="5'6&quot; (168cm)">5'6" (168cm)</SelectItem>
                  <SelectItem value="5'7&quot; (170cm)">5'7" (170cm)</SelectItem>
                  <SelectItem value="5'8&quot; (173cm)">5'8" (173cm)</SelectItem>
                  <SelectItem value="5'9&quot; (175cm)">5'9" (175cm)</SelectItem>
                  <SelectItem value="5'10&quot; (178cm)">5'10" (178cm)</SelectItem>
                  <SelectItem value="5'11&quot; (180cm)">5'11" (180cm)</SelectItem>
                  <SelectItem value="6'0&quot; (183cm)">6'0" (183cm)</SelectItem>
                  <SelectItem value="6'1&quot; (185cm)">6'1" (185cm)</SelectItem>
                  <SelectItem value="6'2&quot; (188cm)">6'2" (188cm)</SelectItem>
                  <SelectItem value="6'3&quot; (191cm)">6'3" (191cm)</SelectItem>
                  <SelectItem value="6'4&quot; (193cm)">6'4" (193cm)</SelectItem>
                  <SelectItem value="6'5&quot; (196cm)">6'5" (196cm)</SelectItem>
                  <SelectItem value="6'6&quot; (198cm)">6'6" (198cm)</SelectItem>
                  <SelectItem value="6'7&quot; (201cm)">6'7" (201cm)</SelectItem>
                  <SelectItem value="6'8&quot; (203cm)">6'8" (203cm)</SelectItem>
                  <SelectItem value="6'9&quot; (206cm)">6'9" (206cm)</SelectItem>
                  <SelectItem value="6'10&quot; (208cm)">6'10" (208cm)</SelectItem>
                  <SelectItem value="6'11&quot; (211cm)">6'11" (211cm)</SelectItem>
                  <SelectItem value="7'0&quot; (213cm)">7'0" (213cm)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Weight</Label>
              <Select value={formData.weight} onValueChange={(value) => handleInputChange("weight", value)}>
                <SelectTrigger id="weight" className="w-full">
                  <SelectValue placeholder="Select weight" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="40kg (88lbs)">40kg (88lbs)</SelectItem>
                  <SelectItem value="45kg (99lbs)">45kg (99lbs)</SelectItem>
                  <SelectItem value="50kg (110lbs)">50kg (110lbs)</SelectItem>
                  <SelectItem value="55kg (121lbs)">55kg (121lbs)</SelectItem>
                  <SelectItem value="60kg (132lbs)">60kg (132lbs)</SelectItem>
                  <SelectItem value="65kg (143lbs)">65kg (143lbs)</SelectItem>
                  <SelectItem value="70kg (154lbs)">70kg (154lbs)</SelectItem>
                  <SelectItem value="75kg (165lbs)">75kg (165lbs)</SelectItem>
                  <SelectItem value="80kg (176lbs)">80kg (176lbs)</SelectItem>
                  <SelectItem value="85kg (187lbs)">85kg (187lbs)</SelectItem>
                  <SelectItem value="90kg (198lbs)">90kg (198lbs)</SelectItem>
                  <SelectItem value="95kg (209lbs)">95kg (209lbs)</SelectItem>
                  <SelectItem value="100kg (220lbs)">100kg (220lbs)</SelectItem>
                  <SelectItem value="105kg (231lbs)">105kg (231lbs)</SelectItem>
                  <SelectItem value="110kg (243lbs)">110kg (243lbs)</SelectItem>
                  <SelectItem value="115kg (254lbs)">115kg (254lbs)</SelectItem>
                  <SelectItem value="120kg (265lbs)">120kg (265lbs)</SelectItem>
                  <SelectItem value="125kg (276lbs)">125kg (276lbs)</SelectItem>
                  <SelectItem value="130kg (287lbs)">130kg (287lbs)</SelectItem>
                  <SelectItem value="135kg (298lbs)">135kg (298lbs)</SelectItem>
                  <SelectItem value="140kg (309lbs)">140kg (309lbs)</SelectItem>
                  <SelectItem value="145kg (320lbs)">145kg (320lbs)</SelectItem>
                  <SelectItem value="150kg (331lbs)">150kg (331lbs)</SelectItem>
                </SelectContent>
              </Select>
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
              <Select value={formData.siblings} onValueChange={(value) => handleInputChange("siblings", value)}>
                <SelectTrigger id="siblings" className="w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">None</SelectItem>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="6">6</SelectItem>
                  <SelectItem value="7">7</SelectItem>
                  <SelectItem value="8">8</SelectItem>
                  <SelectItem value="9">9</SelectItem>
                  <SelectItem value="10+">10+</SelectItem>
                </SelectContent>
              </Select>
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
            <Label>Hobbies & Interests</Label>
            <MultiSelect
              options={HOBBIES_LIST}
              selected={hobbies}
              onChange={setHobbies}
              placeholder="Search and select hobbies..."
            />
            <p className="text-xs text-muted-foreground">
              Select multiple hobbies that interest you. This helps us find better matches.
            </p>
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
