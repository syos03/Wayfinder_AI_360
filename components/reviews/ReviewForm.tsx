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
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <p className="text-center text-gray-700">
            Vui lòng <a href="/login" className="text-blue-600 underline">đăng nhập</a> để viết đánh giá
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Viết đánh giá cho {destinationName}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Đánh giá của bạn <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoverRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm text-gray-600 self-center">
                  {rating === 1 && 'Rất tệ'}
                  {rating === 2 && 'Tệ'}
                  {rating === 3 && 'Tạm được'}
                  {rating === 4 && 'Tốt'}
                  {rating === 5 && 'Tuyệt vời'}
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
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {success}
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


