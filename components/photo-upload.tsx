"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, X, Loader2 } from "lucide-react"
import { uploadToCloudinary } from "@/lib/cloudinary"
import { useToast } from "@/hooks/use-toast"

interface PhotoUploadProps {
  onUploadComplete: (urls: string[]) => void
  maxFiles?: number
  currentPhotos?: string[]
}

export function PhotoUpload({ onUploadComplete, maxFiles = 6, currentPhotos = [] }: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [previews, setPreviews] = useState<string[]>(currentPhotos)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    if (previews.length + files.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `You can only upload up to ${maxFiles} photos`,
        variant: "destructive",
      })
      return
    }

    setUploading(true)

    try {
      const uploadedUrls: string[] = []

      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          toast({
            title: "Invalid file type",
            description: "Please upload only image files",
            variant: "destructive",
          })
          continue
        }

        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: "Please upload images smaller than 5MB",
            variant: "destructive",
          })
          continue
        }

        const result = await uploadToCloudinary(file)
        uploadedUrls.push(result.secure_url)
      }

      const newPreviews = [...previews, ...uploadedUrls]
      setPreviews(newPreviews)
      onUploadComplete(newPreviews)

      toast({
        title: "Upload successful",
        description: `${uploadedUrls.length} photo(s) uploaded successfully`,
      })
    } catch (error) {
      console.error("[v0] Upload error:", error)
      toast({
        title: "Upload failed",
        description: "Failed to upload photos. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleRemove = (index: number) => {
    const newPreviews = previews.filter((_, i) => i !== index)
    setPreviews(newPreviews)
    onUploadComplete(newPreviews)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {previews.map((preview, index) => (
          <div key={index} className="group relative aspect-square overflow-hidden rounded-lg border border-border">
            <img
              src={preview || "/placeholder.svg"}
              alt={`Upload ${index + 1}`}
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute right-2 top-2 rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}

        {previews.length < maxFiles && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            ) : (
              <div className="text-center">
                <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-xs text-muted-foreground">Upload Photo</p>
              </div>
            )}
          </button>
        )}
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" />

      <p className="text-xs text-muted-foreground">
        Upload up to {maxFiles} photos. Max size 5MB per photo. Supported formats: JPG, PNG, GIF
      </p>
    </div>
  )
}
