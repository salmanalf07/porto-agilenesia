"use client"
import Image from "next/image"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  PlusIcon,
  XIcon,
  ImageOffIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  UploadIcon,
  FileImageIcon,
  CheckCircleIcon,
  LoaderIcon,
} from "lucide-react"
import { uploadImageToSupabase, deleteImageFromSupabase, validateImageFile, formatFileSize } from "@/lib/utils"
import { useState, useRef, useCallback } from "react"

export interface ProjectImageInput {
  url: string
  alt: string
  caption?: string
  file?: File
  isUploading?: boolean
}

interface ProjectGalleryInputProps {
  value: ProjectImageInput[]
  onChange: (images: ProjectImageInput[]) => void
  disabled?: boolean
}

export function ProjectGalleryInput({ value, onChange, disabled }: ProjectGalleryInputProps) {
  const [uploadProgress, setUploadProgress] = useState<{ [key: number]: number }>({})
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({})

  const handleImageChange = (index: number, field: keyof ProjectImageInput, fieldValue: string) => {
    const updatedImages = [...value]
    updatedImages[index] = { ...updatedImages[index], [field]: fieldValue }
    onChange(updatedImages)
  }

  const handleFileSelect = useCallback(
    async (index: number, file: File) => {
      // Validate file
      const validation = validateImageFile(file)
      if (!validation.isValid) {
        alert(validation.error)
        return
      }

      // Update state to show uploading
      const updatedImages = [...value]
      updatedImages[index] = {
        ...updatedImages[index],
        file,
        isUploading: true,
        url: URL.createObjectURL(file), // Temporary preview URL
      }
      onChange(updatedImages)

      try {
        // Simulate upload progress
        setUploadProgress((prev) => ({ ...prev, [index]: 0 }))

        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            const currentProgress = prev[index] || 0
            if (currentProgress < 90) {
              return { ...prev, [index]: currentProgress + 10 }
            }
            return prev
          })
        }, 200)

        // Upload to Supabase
        const uploadedUrl = await uploadImageToSupabase(file)

        clearInterval(progressInterval)
        setUploadProgress((prev) => ({ ...prev, [index]: 100 }))

        if (uploadedUrl) {
          // Update with uploaded URL
          const finalImages = [...value]
          finalImages[index] = {
            ...finalImages[index],
            url: uploadedUrl,
            isUploading: false,
            file: undefined,
          }
          onChange(finalImages)

          // Clean up progress after a delay
          setTimeout(() => {
            setUploadProgress((prev) => {
              const newProgress = { ...prev }
              delete newProgress[index]
              return newProgress
            })
          }, 1000)
        } else {
          throw new Error("Upload failed")
        }
      } catch (error) {
        console.error("Upload error:", error)

        // Reset on error
        const errorImages = [...value]
        errorImages[index] = {
          ...errorImages[index],
          url: "",
          isUploading: false,
          file: undefined,
        }
        onChange(errorImages)

        setUploadProgress((prev) => {
          const newProgress = { ...prev }
          delete newProgress[index]
          return newProgress
        })

        alert("Upload failed. Please try again.")
      }
    },
    [value, onChange],
  )

  const handleFileInputChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileSelect(index, file)
    }
  }

  const handleDrop = useCallback(
    (index: number, event: React.DragEvent) => {
      event.preventDefault()
      const file = event.dataTransfer.files[0]
      if (file && file.type.startsWith("image/")) {
        handleFileSelect(index, file)
      }
    },
    [handleFileSelect],
  )

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  const handleAddImage = () => {
    onChange([...value, { url: "", alt: "" }])
  }

  const handleRemoveImage = async (index: number) => {
    const imageToRemove = value[index]

    // Delete from Supabase if it's an uploaded image
    if (imageToRemove.url && imageToRemove.url.includes("supabase")) {
      try {
        await deleteImageFromSupabase(imageToRemove.url)
      } catch (error) {
        console.error("Error deleting image:", error)
      }
    }

    const updatedImages = [...value]
    updatedImages.splice(index, 1)
    onChange(updatedImages)

    // Clean up progress state
    setUploadProgress((prev) => {
      const newProgress = { ...prev }
      delete newProgress[index]
      return newProgress
    })
  }

  const handleMoveImage = (index: number, direction: "up" | "down") => {
    const updatedImages = [...value]
    if (direction === "up" && index > 0) {
      ;[updatedImages[index - 1], updatedImages[index]] = [updatedImages[index], updatedImages[index - 1]]
    } else if (direction === "down" && index < updatedImages.length - 1) {
      ;[updatedImages[index + 1], updatedImages[index]] = [updatedImages[index], updatedImages[index + 1]]
    }
    onChange(updatedImages)
  }

  const triggerFileInput = (index: number) => {
    fileInputRefs.current[index]?.click()
  }

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
        <UploadIcon className="h-4 w-4 text-blue-600" />
        <AlertDescription>
          <div className="space-y-2">
            <h4 className="font-medium text-blue-900 dark:text-blue-100">📁 Upload Project Images</h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside pl-4">
              <li>Click "Choose File" or drag & drop images</li>
              <li>Supported formats: JPG, PNG, GIF, WebP</li>
              <li>Maximum file size: 5MB per image</li>
              <li>Images are automatically uploaded to secure storage</li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>

      {/* Image Inputs */}
      {value.map((image, index) => {
        const progress = uploadProgress[index]
        const isUploading = image.isUploading || progress !== undefined

        return (
          <div key={index} className="border rounded-lg p-4 space-y-4 relative bg-card">
            {!disabled && (
              <div className="absolute top-2 right-2 z-10 flex gap-1">
                {value.length > 1 && (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-6 w-6 bg-background/80 backdrop-blur-sm"
                      onClick={() => handleMoveImage(index, "up")}
                      disabled={index === 0 || isUploading}
                      aria-label={`Move image ${index + 1} up`}
                    >
                      <ChevronUpIcon className="h-3 w-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-6 w-6 bg-background/80 backdrop-blur-sm"
                      onClick={() => handleMoveImage(index, "down")}
                      disabled={index === value.length - 1 || isUploading}
                      aria-label={`Move image ${index + 1} down`}
                    >
                      <ChevronDownIcon className="h-3 w-3" />
                    </Button>
                  </>
                )}
                {value.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleRemoveImage(index)}
                    disabled={isUploading}
                    aria-label={`Remove image ${index + 1}`}
                  >
                    <XIcon className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              {/* Image Preview */}
              <div className="md:col-span-1">
                <div className="relative aspect-[16/9] rounded-md overflow-hidden bg-muted flex items-center justify-center border">
                  {image.url ? (
                    <>
                      <Image
                        src={image.url || "/placeholder.svg"}
                        alt={image.alt || `Gallery image ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      {isUploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div className="text-white text-center">
                            <LoaderIcon className="h-8 w-8 animate-spin mx-auto mb-2" />
                            <p className="text-xs">Uploading...</p>
                            {progress !== undefined && <p className="text-xs">{progress}%</p>}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <ImageOffIcon className="h-10 w-10 mb-2" />
                      <p className="text-xs">No image</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Fields */}
              <div className="md:col-span-2 space-y-4">
                {/* File Upload */}
                <div>
                  <Label className="text-sm font-medium">
                    Upload Image {index === 0 && <span className="text-xs text-muted-foreground">(Main image)</span>}
                  </Label>

                  <input
                    ref={(el) => (fileInputRefs.current[index] = el)}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileInputChange(index, e)}
                    className="hidden"
                    disabled={disabled || isUploading}
                  />

                  <div
                    className={`mt-2 border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                      isUploading
                        ? "border-blue-300 bg-blue-50 dark:bg-blue-950"
                        : "border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                    onClick={() => !isUploading && !disabled && triggerFileInput(index)}
                    onDrop={(e) => !isUploading && !disabled && handleDrop(index, e)}
                    onDragOver={handleDragOver}
                  >
                    {isUploading ? (
                      <div className="space-y-2">
                        <LoaderIcon className="h-8 w-8 animate-spin mx-auto text-blue-600" />
                        <p className="text-sm text-blue-600">Uploading...</p>
                        {progress !== undefined && <Progress value={progress} className="w-full" />}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <FileImageIcon className="h-8 w-8 mx-auto text-gray-400" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">Click to choose file or drag & drop</p>
                        <p className="text-xs text-gray-500">JPG, PNG, GIF, WebP (max 5MB)</p>
                      </div>
                    )}
                  </div>

                  {/* Upload Status */}
                  {image.url && !isUploading && (
                    <div className="flex items-center gap-2 mt-2 text-xs text-green-600">
                      <CheckCircleIcon className="h-3 w-3" />
                      <span>Image uploaded successfully</span>
                    </div>
                  )}

                  {/* File Info */}
                  {image.file && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      <p>File: {image.file.name}</p>
                      <p>Size: {formatFileSize(image.file.size)}</p>
                    </div>
                  )}
                </div>

                {/* Alt Text */}
                <div>
                  <Label htmlFor={`image-alt-${index}`} className="text-sm font-medium">
                    Image Description (Alt Text)
                  </Label>
                  <Input
                    id={`image-alt-${index}`}
                    value={image.alt}
                    onChange={(e) => handleImageChange(index, "alt", e.target.value)}
                    placeholder="Describe what's in the image"
                    disabled={disabled}
                  />
                  <p className="text-xs text-muted-foreground mt-1">This helps with accessibility and SEO</p>
                </div>
              </div>
            </div>
          </div>
        )
      })}

      {/* Add Image Button */}
      {!disabled && (
        <Button
          type="button"
          variant="outline"
          onClick={handleAddImage}
          className="flex items-center w-full justify-center border-dashed border-2 h-12 hover:bg-muted/50 bg-transparent"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Another Image
        </Button>
      )}

      {/* Additional Help */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>• The first image will be used as the main project image</p>
        <p>• All images are stored securely in cloud storage</p>
        <p>• You can reorder images using the up/down arrows</p>
        <p>• Images are automatically optimized for web display</p>
      </div>
    </div>
  )
}
