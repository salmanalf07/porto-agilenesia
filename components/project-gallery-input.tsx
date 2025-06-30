"use client"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlusIcon, XIcon, ImageOffIcon, ChevronUpIcon, ChevronDownIcon } from "lucide-react"

export interface ProjectImageInput {
  url: string
  alt: string
  caption?: string // Keep caption for consistency with ProjectImage, though not directly editable here
}

interface ProjectGalleryInputProps {
  value: ProjectImageInput[]
  onChange: (images: ProjectImageInput[]) => void
  disabled?: boolean
}

export function ProjectGalleryInput({ value, onChange, disabled }: ProjectGalleryInputProps) {
  const handleImageChange = (index: number, field: keyof ProjectImageInput, fieldValue: string) => {
    const updatedImages = [...value]
    updatedImages[index] = { ...updatedImages[index], [field]: fieldValue }
    onChange(updatedImages)
  }

  const handleAddImage = () => {
    onChange([...value, { url: "", alt: "" }])
  }

  const handleRemoveImage = (index: number) => {
    const updatedImages = [...value]
    updatedImages.splice(index, 1)
    onChange(updatedImages)
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

  return (
    <div className="space-y-6">
      {value.map((image, index) => (
        <div key={index} className="border rounded-md p-4 space-y-4 relative">
          {!disabled && (
            <div className="absolute top-2 right-2 z-10 flex gap-1">
              {value.length > 1 && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleMoveImage(index, "up")}
                    disabled={index === 0}
                    aria-label={`Move image ${index + 1} up`}
                  >
                    <ChevronUpIcon className="h-3 w-3" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleMoveImage(index, "down")}
                    disabled={index === value.length - 1}
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
                  aria-label={`Remove image ${index + 1}`}
                >
                  <XIcon className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="md:col-span-1 relative aspect-[16/9] rounded-md overflow-hidden bg-muted flex items-center justify-center">
              {image.url ? (
                <Image
                  src={image.url || "/placeholder.svg"}
                  alt={image.alt || `Gallery image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              ) : (
                <ImageOffIcon className="h-10 w-10 text-muted-foreground" />
              )}
            </div>
            <div className="md:col-span-2 space-y-3">
              <div>
                <Label htmlFor={`image-url-${index}`}>Image URL</Label>
                <Input
                  id={`image-url-${index}`}
                  value={image.url}
                  onChange={(e) => handleImageChange(index, "url", e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  disabled={disabled}
                />
              </div>
              <div>
                <Label htmlFor={`image-alt-${index}`}>Alt Text (Name)</Label>
                <Input
                  id={`image-alt-${index}`}
                  value={image.alt}
                  onChange={(e) => handleImageChange(index, "alt", e.target.value)}
                  placeholder="Description of the image"
                  disabled={disabled}
                />
              </div>
            </div>
          </div>
        </div>
      ))}
      {!disabled && (
        <Button type="button" variant="outline" onClick={handleAddImage} className="flex items-center">
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Image
        </Button>
      )}
    </div>
  )
}
