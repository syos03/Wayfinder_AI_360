'use client'

/**
 * Review List Component
 * Displays reviews with filtering and pagination
 */

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  ChevronLeft, 
  ChevronRight,
  Loader2,
  MessageSquare
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { toast } from 'sonner'

interface Review {
  _id: string
  userName: string
  userAvatar?: string
  rating: number
  title: string
  content: string
  photos: string[]
  helpful: number
  notHelpful: number
  helpfulBy: string[]
  notHelpfulBy: string[]
  createdAt: string
}

interface ReviewListProps {
  destinationId: string
}

export function ReviewList({ destinationId }: ReviewListProps) {
  const { user, isAuthenticated } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [sort, setSort] = useState('newest')

  useEffect(() => {
    fetchReviews()
  }, [destinationId, page, sort])

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/reviews?destinationId=${destinationId}&page=${page}&limit=10&sort=${sort}`
      )
      const data = await res.json()

      if (data.success) {
        setReviews(data.data.reviews)
        setStats(data.data.stats)
        setTotalPages(data.data.pagination.pages)
      }
    } catch (err) {
      console.error('Error fetching reviews:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (reviewId: string, isHelpful: boolean) => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để vote')
      return
    }

    try {
      const res = await fetch(`/api/reviews/${reviewId}/helpful`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isHelpful }),
        credentials: 'include',
      })

      if (res.ok) {
        toast.success(isHelpful ? 'Đã đánh dấu hữu ích' : 'Đã đánh dấu không hữu ích')
        fetchReviews()
      }
    } catch (err) {
      console.error('Error voting:', err)
      toast.error('Có lỗi xảy ra')
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  const renderRatingDistribution = () => {
    if (!stats || stats.totalReviews === 0) return null

    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = stats[`rating${rating}`] || 0
          const percentage = (count / stats.totalReviews) * 100

          return (
            <div key={rating} className="flex items-center gap-3 text-sm">
              <span className="w-12">{rating} sao</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-12 text-gray-600 text-right">{count}</span>
            </div>
          )
        })}
      </div>
    )
  }

  if (loading && reviews.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && stats.totalReviews > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Average Rating */}
              <div className="text-center">
                <div className="text-5xl font-bold text-gray-900">
                  {stats.avgRating.toFixed(1)}
                </div>
                <div className="flex justify-center my-2">
                  {renderStars(Math.round(stats.avgRating))}
                </div>
                <p className="text-sm text-gray-600">
                  {stats.totalReviews} đánh giá
                </p>
              </div>

              {/* Rating Distribution */}
              <div className="md:col-span-2">
                {renderRatingDistribution()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sort Options */}
      <div className="flex flex-wrap gap-2">
        <span className="text-sm font-medium self-center">Sắp xếp:</span>
        {[
          { value: 'newest', label: 'Mới nhất' },
          { value: 'oldest', label: 'Cũ nhất' },
          { value: 'highest', label: 'Cao nhất' },
          { value: 'lowest', label: 'Thấp nhất' },
          { value: 'helpful', label: 'Hữu ích nhất' },
        ].map((option) => (
          <Button
            key={option.value}
            variant={sort === option.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setSort(option.value)
              setPage(1)
            }}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Chưa có đánh giá nào</p>
              <p className="text-sm text-gray-500 mt-2">Hãy là người đầu tiên đánh giá!</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const hasVotedHelpful = user && review.helpfulBy.includes(user.id)
            const hasVotedNotHelpful = user && review.notHelpfulBy.includes(user.id)

            return (
              <Card key={review._id}>
                <CardContent className="pt-6">
                  {/* User Info & Rating */}
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar>
                      <AvatarImage src={review.userAvatar} />
                      <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-medium">{review.userName}</span>
                        <Badge variant="outline" className="whitespace-normal break-words max-w-full">
                          {renderStars(review.rating)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(review.createdAt), {
                          addSuffix: true,
                          locale: vi,
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Title & Content */}
                  <h3 className="font-semibold text-lg mb-2">{review.title}</h3>
                  <p className="text-gray-700 mb-4 whitespace-pre-wrap">{review.content}</p>

                  {/* Photos */}
                  {review.photos.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {review.photos.map((photo, idx) => (
                        <img
                          key={idx}
                          src={photo}
                          alt={`Review photo ${idx + 1}`}
                          className="w-full h-32 object-cover rounded"
                        />
                      ))}
                    </div>
                  )}

                  {/* Helpful Buttons */}
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-600">Đánh giá này có hữu ích không?</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVote(review._id, true)}
                      className={hasVotedHelpful ? 'bg-blue-50 border-blue-300' : ''}
                    >
                      <ThumbsUp className="w-4 h-4 mr-1" />
                      Hữu ích ({review.helpful})
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVote(review._id, false)}
                      className={hasVotedNotHelpful ? 'bg-red-50 border-red-300' : ''}
                    >
                      <ThumbsDown className="w-4 h-4 mr-1" />
                      Không ({review.notHelpful})
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-gray-600">
            Trang {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  )
}


