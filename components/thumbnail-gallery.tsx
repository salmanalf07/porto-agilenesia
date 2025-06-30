"use client"

import { useState } from "react"
import Image from "next/image"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface GalleryImage {
  url: string
  alt: string
  caption?: string
}

interface ThumbnailGalleryProps {
  images: GalleryImage[]
  className?: string
}

export function ThumbnailGallery({ images, className }: ThumbnailGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  // Handle main image selection
  const handleSelectImage = (index: number) => {
    setSelectedIndex(index)
  }

  // Open lightbox with specific image
  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  // Navigate through lightbox images
  const navigateLightbox = (direction: "next" | "prev") => {
    if (direction === "next") {
      setLightboxIndex((prev) => (prev + 1) % images.length)
    } else {
      setLightboxIndex((prev) => (prev - 1 + images.length) % images.length)
    }
  }

  // If no images, don't render anything
  if (!images.length) return null

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main selected image */}
      <div
        className="relative aspect-[16/9] overflow-hidden rounded-lg cursor-pointer"
        onClick={() => openLightbox(selectedIndex)}
      >
        <Image
          src={images[selectedIndex].url || "/placeholder.svg"}
          alt={images[selectedIndex].alt}
          fill
          className="object-cover transition-transform duration-300 hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
        />
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 text-white bg-black/50 hover:bg-black/70"
              onClick={(e) => {
                e.stopPropagation()
                setSelectedIndex((prev) => (prev - 1 + images.length) % images.length)
              }}
            >
              <ChevronLeftIcon className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 text-white bg-black/50 hover:bg-black/70"
              onClick={(e) => {
                e.stopPropagation()
                setSelectedIndex((prev) => (prev + 1) % images.length)
              }}
            >
              <ChevronRightIcon className="h-6 w-6" />
            </Button>
          </>
        )}
        {images[selectedIndex].caption && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 text-sm">
            {images[selectedIndex].caption}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex overflow-x-auto gap-2 pb-2 snap-x">
          {images.map((image, index) => (
            <div
              key={index}
              className={cn(
                "flex-shrink-0 cursor-pointer relative w-20 h-20 md:w-24 md:h-24 snap-start",
                selectedIndex === index ? "ring-2 ring-primary" : "ring-1 ring-border/50",
              )}
              onClick={() => handleSelectImage(index)}
            >
              <Image
                src={image.url || "/placeholder.svg"}
                alt={image.alt}
                fill
                className="object-cover rounded-md"
                sizes="96px"
              />
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-screen-lg w-full p-0 bg-transparent border-none">
          <div className="relative bg-black/95 rounded-lg overflow-hidden">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-50 text-white bg-black/50 hover:bg-black/70"
              onClick={() => setLightboxOpen(false)}
            >
              <XIcon className="h-5 w-5" />
            </Button>

            <div className="relative h-[80vh] flex items-center justify-center">
              <Image
                src={images[lightboxIndex].url || "/placeholder.svg"}
                alt={images[lightboxIndex].alt}
                fill
                className="object-contain"
                sizes="100vw"
              />

              {images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 z-40 text-white bg-black/50 hover:bg-black/70"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigateLightbox("prev")
                    }}
                  >
                    <ChevronLeftIcon className="h-8 w-8" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 z-40 text-white bg-black/50 hover:bg-black/70"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigateLightbox("next")
                    }}
                  >
                    <ChevronRightIcon className="h-8 w-8" />
                  </Button>
                </>
              )}
            </div>

            {images[lightboxIndex].caption && (
              <div className="p-4 text-white text-center">{images[lightboxIndex].caption}</div>
            )}

            {/* Thumbnail navigation in lightbox */}
            {images.length > 1 && (
              <div className="flex justify-center gap-2 p-4 bg-black/80">
                {images.map((image, index) => (
                  <div
                    key={index}
                    className={cn(
                      "w-16 h-12 cursor-pointer relative",
                      lightboxIndex === index ? "ring-2 ring-primary" : "opacity-70 hover:opacity-100",
                    )}
                    onClick={() => setLightboxIndex(index)}
                  >
                    <Image
                      src={image.url || "/placeholder.svg"}
                      alt={image.alt}
                      fill
                      className="object-cover rounded-sm"
                      sizes="64px"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
