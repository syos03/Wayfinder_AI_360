'use client'

/**
 * Review Form Component
 * For creating and editing reviews
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Star, Upload, X, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { trackReviewSubmitted } from '@/lib/analytics'

interface ReviewFormProps {
  destinationId: string
  destinationName: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function ReviewForm({ destinationId, destinationName, onSuccess, onCancel }: ReviewFormProps) {
  const { user, isAuthenticated } = useAuth()
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [photoInput, setPhotoInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!isAuthenticated) {
      setError('Vui lòng đăng nhập để viết đánh giá')
      return
    }

    if (rating === 0) {
      setError('Vui lòng chọn số sao')
      return
    }

    if (!title.trim()) {
      setError('Vui lòng nhập tiêu đề')
      return
    }

    if (!content.trim()) {
      setError('Vui lòng nhập nội dung đánh giá')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destinationId,
          rating,
          title: title.trim(),
          content: content.trim(),
          photos,
        }),
        credentials: 'include',
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Không thể tạo đánh giá')
      }

      setSuccess(data.message || 'Đánh giá đã được gửi!')
      
      // Track review submission with PostHog
      trackReviewSubmitted({
        reviewId: data.data?.review?._id,
        destinationId: destinationId,
        destinationName: destinationName,
        rating: rating,
        hasPhotos: photos.length > 0,
        reviewLength: content.length,
      });
      
      // Reset form
      setRating(0)
      setTitle('')
      setContent('')
      setPhotos([])
      setPhotoInput('')

      // Call success callback
      if (onSuccess) {
        setTimeout(() => onSuccess(), 1500)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const addPhoto = () => {
    if (photoInput.trim() && photos.length < 5) {
      setPhotos([...photos, photoInput.trim()])
      setPhotoInput('')
    }
  }

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index))
  }

  if (!isAuthenticated) {
    return (
      <Card className="border-primary/20 bg-primary/5 backdrop-blur-md">
        <CardContent className="pt-8 text-center px-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-primary" />
          </div>
          <p className="text-foreground/80 font-medium text-lg">
            Vui lòng <Link href="/login" className="text-primary font-bold hover:underline transition-all">đăng nhập</Link> để viết đánh giá và chia sẻ trải nghiệm của bạn.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl">
      <CardHeader className="pb-2 px-6 pt-6">
        <CardTitle className="text-xl font-black tracking-tight flex items-center gap-3">
          <div className="w-1.5 h-6 bg-primary rounded-full" />
          Viết đánh giá cho {destinationName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Đánh giá của bạn <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border/50">
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-all hover:scale-125 hover:rotate-12 active:scale-95"
                  >
                    <Star
                      className={`w-10 h-10 transition-all duration-300 ${
                        star <= (hoverRating || rating)
                          ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]'
                          : 'text-muted-foreground/30'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <span className="text-base font-bold text-foreground animate-in fade-in slide-in-from-left-2">
                  {rating === 1 && '👎 Rất tệ'}
                  {rating === 2 && '😕 Tệ'}
                  {rating === 3 && '😐 Tạm được'}
                  {rating === 4 && '😊 Tốt'}
                  {rating === 5 && '🤩 Tuyệt vời'}
                </span>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Tóm tắt trải nghiệm của bạn"
              maxLength={100}
              required
            />
            <p className="text-xs text-gray-500 mt-1">{title.length}/100 ký tự</p>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Nội dung đánh giá <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Chia sẻ chi tiết về trải nghiệm của bạn..."
              rows={6}
              maxLength={2000}
              required
            />
            <p className="text-xs text-gray-500 mt-1">{content.length}/2000 ký tự</p>
          </div>

          {/* Photos */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Hình ảnh (Tùy chọn)
            </label>
            <div className="flex gap-2 mb-3">
              <Input
                value={photoInput}
                onChange={(e) => setPhotoInput(e.target.value)}
                placeholder="URL hình ảnh"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addPhoto()
                  }
                }}
              />
              <Button type="button" onClick={addPhoto} disabled={photos.length >= 5}>
                <Upload className="w-4 h-4 mr-2" />
                Thêm
              </Button>
            </div>
            
            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={photo}
                      alt={`Review photo ${index + 1}`}
                      className="w-full h-24 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">Tối đa 5 hình ảnh</p>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-6 py-4 rounded-xl flex items-center gap-3 animate-in fade-in zoom-in-95">
              <X className="w-5 h-5 flex-shrink-0" />
              <p className="font-medium">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-6 py-4 rounded-xl flex items-center gap-3 animate-in fade-in zoom-in-95">
              <Loader2 className="w-5 h-5 animate-spin" />
              <p className="font-medium">{success}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                'Gửi đánh giá'
              )}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Hủy
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}


