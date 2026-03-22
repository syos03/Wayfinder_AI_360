"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react"
import SafeImage from "@/components/common/SafeImage"
import type { ProvinceImage } from "@/data/province-images"

interface PhotoGalleryProps {
  images: ProvinceImage[]
  provinceName: string
}

export function PhotoGallery({ images, provinceName }: PhotoGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  if (images.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Chưa có hình ảnh cho {provinceName}</p>
      </div>
    )
  }

  const openLightbox = (index: number) => setSelectedIndex(index)
  const closeLightbox = () => setSelectedIndex(null)
  const goNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % images.length)
    }
  }
  const goPrev = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + images.length) % images.length)
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <Card
            key={index}
            className="border-0 shadow-lg overflow-hidden cursor-pointer group hover:shadow-xl transition-shadow"
            onClick={() => openLightbox(index)}
          >
            <CardContent className="p-0 relative">
              <div className="h-56 bg-gray-100 overflow-hidden relative">
                <SafeImage
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              {image.caption && (
                <div className="p-3">
                  <p className="text-sm text-gray-600">{image.caption}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Lightbox */}
      {selectedIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
          <Button
            variant="ghost"
            className="absolute top-4 right-4 text-white hover:bg-white/20"
            onClick={closeLightbox}
          >
            <X className="w-6 h-6" />
          </Button>

          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                className="absolute left-4 text-white hover:bg-white/20"
                onClick={goPrev}
              >
                <ChevronLeft className="w-8 h-8" />
              </Button>
              <Button
                variant="ghost"
                className="absolute right-4 text-white hover:bg-white/20"
                onClick={goNext}
              >
                <ChevronRight className="w-8 h-8" />
              </Button>
            </>
          )}

          <div className="max-w-4xl max-h-[80vh] px-16">
            <div className="relative w-full h-[70vh]">
              <SafeImage
                src={images[selectedIndex].src}
                alt={images[selectedIndex].alt}
                fill
                priority
                className="object-contain mx-auto"
              />
            </div>
            {images[selectedIndex].caption && (
              <p className="text-white text-center mt-4 text-lg">
                {images[selectedIndex].caption}
              </p>
            )}
            <p className="text-white/60 text-center mt-2">
              {selectedIndex + 1} / {images.length}
            </p>
          </div>
        </div>
      )}
    </>
  )
}
