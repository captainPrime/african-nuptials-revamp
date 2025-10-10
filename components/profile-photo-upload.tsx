"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Loader2 } from "lucide-react"
import { uploadToCloudinary } from "@/lib/cloudinary"
import { useToast } from "@/hooks/use-toast"

interface ProfilePhotoUploadProps {
  currentPhoto?: string
  onUploadComplete: (url: string) => void
  initials?: string
}

export function ProfilePhotoUpload({ currentPhoto, onUploadComplete, initials = "AN" }: ProfilePhotoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(currentPhoto)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload only image files",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 2MB",
        variant: "destructive",
      })
      return
    }

    setUploading(true)

    try {
      const result = await uploadToCloudinary(file)
      const newUrl = result.secure_url

      setPreview(newUrl)
      onUploadComplete(newUrl)

      toast({
        title: "Upload successful",
        description: "Profile photo updated successfully",
      })
    } catch (error) {
      console.error("[v0] Upload error:", error)
      toast({
        title: "Upload failed",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <div className="relative inline-block">
      <Avatar className="h-24 w-24">
        <AvatarImage src={preview || "/placeholder.svg"} />
        <AvatarFallback className="bg-primary text-2xl text-primary-foreground">{initials}</AvatarFallback>
      </Avatar>
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
      </button>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
    </div>
  )
}
