"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { XIcon, UploadCloudIcon, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface LogoFileUploaderProps {
  value?: string // Current logo URL or base64
  onChange: (file: File | null, previewUrl: string | null) => void
  disabled?: boolean
  emptyStateAspectRatioClass?: string | null // New prop to control aspect ratio when empty
}

export function LogoFileUploader({ value, onChange, disabled, emptyStateAspectRatioClass }: LogoFileUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null)
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Update internal preview if external value changes
    if (value !== previewUrl && !file) {
      setPreviewUrl(value || null)
    }
  }, [value, previewUrl, file])

  const validateFile = (file: File): boolean => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file (JPG, PNG, GIF, WebP).")
      return false
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB.")
      return false
    }

    return true
  }

  const processFile = (file: File) => {
    if (!validateFile(file)) return

    setFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      const newPreviewUrl = reader.result as string
      setPreviewUrl(newPreviewUrl)
      onChange(file, newPreviewUrl)
    }
    reader.readAsDataURL(file)
  }

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0]
      if (selectedFile) {
        processFile(selectedFile)
      }
    },
    [onChange],
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDragEnter = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      if (!disabled) {
        setIsDragging(true)
      }
    },
    [disabled],
  )

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      if (disabled) return

      const droppedFile = e.dataTransfer.files?.[0]
      if (droppedFile) {
        processFile(droppedFile)
      }
    },
    [disabled, onChange],
  )

  const handleRemove = useCallback(() => {
    setFile(null)
    setPreviewUrl(null)
    onChange(null, null)
    // Reset the file input value to allow re-uploading the same file
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [onChange])

  const handleBrowseClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }, [])

  return (
    <div className="space-y-4">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={disabled}
        className="hidden"
        aria-label="Upload logo"
      />

      {/* Drop zone */}
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 transition-all duration-200 ease-in-out",
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50 bg-muted/30",
          disabled && "opacity-60 cursor-not-allowed",
          previewUrl ? "aspect-[3/2]" : emptyStateAspectRatioClass || "",
        )}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={disabled ? undefined : handleBrowseClick}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
      >
        {previewUrl ? (
          // Preview with image
          <div className="relative w-full h-full">
            <Image
              src={previewUrl || "/placeholder.svg"}
              alt="Logo preview"
              fill
              className="object-contain rounded-md"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {!disabled && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 z-10 opacity-90 hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemove()
                }}
              >
                <XIcon className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          // Empty state
          <div className="flex flex-col items-center justify-center text-center space-y-4 h-full">
            <div className="rounded-full bg-muted p-3">
              <UploadCloudIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">
                {isDragging ? "Drop the image here" : "Drag and drop your logo here"}
              </p>
              <p className="text-xs text-muted-foreground">
                or <span className="text-primary font-medium hover:underline cursor-pointer">browse files</span>
              </p>
            </div>
            <p className="text-xs text-muted-foreground">Supports: JPG, PNG, GIF, WebP (max 5MB)</p>
          </div>
        )}
      </div>

      {/* Actions */}
      {previewUrl && (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleBrowseClick}
            disabled={disabled}
            className="flex items-center gap-2"
          >
            <ImageIcon className="h-4 w-4" />
            Change Image
          </Button>
        </div>
      )}
    </div>
  )
}
