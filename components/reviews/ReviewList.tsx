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
import SafeImage from '@/components/common/SafeImage'
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
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 transition-all ${
              star <= rating ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_4px_rgba(250,204,21,0.2)]' : 'text-muted-foreground/30'
            }`}
          />
        ))}
      </div>
    );
  };

  const renderRatingDistribution = () => {
    if (!stats || stats.totalReviews === 0) return null

    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = stats[`rating${rating}`] || 0
          const percentage = (count / stats.totalReviews) * 100

          return (
            <div key={rating} className="flex items-center gap-4 text-sm font-medium">
              <span className="w-12 text-muted-foreground">{rating} sao</span>
              <div className="flex-1 bg-muted rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-yellow-400 h-full rounded-full shadow-[0_0_8px_rgba(250,204,21,0.3)] transition-all duration-1000"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-12 text-foreground text-right">{count}</span>
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
        <Card className="border-border/50 bg-card/30 backdrop-blur-md shadow-xl overflow-hidden">
          <CardContent className="pt-8 px-8 pb-8">
            <div className="grid md:grid-cols-3 gap-8 items-center">
              {/* Average Rating */}
              <div className="text-center md:border-r border-border/50 px-4">
                <div className="text-6xl font-black text-foreground tracking-tighter mb-1">
                  {stats.avgRating.toFixed(1)}
                </div>
                <div className="flex justify-center mb-3 scale-110 origin-center">
                  {renderStars(Math.round(stats.avgRating))}
                </div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  {stats.totalReviews} đánh giá
                </p>
              </div>

              {/* Rating Distribution */}
              <div className="md:col-span-2 space-y-3">
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
              <Card key={review._id} className="border-border/40 bg-card/60 backdrop-blur-sm hover:border-primary/30 transition-all group overflow-hidden shadow-lg">
                <CardContent className="pt-6 px-6 pb-6">
                  {/* User Info & Rating */}
                  <div className="flex items-start gap-3 mb-4">
                    <Avatar className="w-10 h-10 border-2 border-primary/20 shadow-inner">
                      <AvatarImage src={review.userAvatar} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">{review.userName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="font-bold text-base">{review.userName}</span>
                        <div className="px-2 py-0.5 bg-muted rounded-full border border-border/50 scale-75 origin-left">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                      <p className="text-[11px] text-muted-foreground font-medium">
                        {formatDistanceToNow(new Date(review.createdAt), {
                          addSuffix: true,
                          locale: vi,
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Title & Content */}
                  <h3 className="font-bold text-lg mb-2 tracking-tight">{review.title}</h3>
                  <p className="text-foreground/80 mb-4 whitespace-pre-wrap leading-relaxed font-medium text-sm">{review.content}</p>

                  {/* Photos */}
                  {review.photos.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                      {review.photos.map((photo, idx) => (
                        <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-border/50 shadow-sm group-hover:shadow-md transition-shadow">
                          <SafeImage
                            src={photo}
                            alt={`Review photo ${idx + 1}`}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Helpful Buttons */}
                  <div className="flex items-center gap-6 pt-6 border-t border-border/50">
                    <span className="text-sm text-muted-foreground font-bold">Hữu ích?</span>
                    <div className="flex gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVote(review._id, true)}
                        className={`rounded-full h-10 px-4 flex items-center gap-2 translate-all ${
                          hasVotedHelpful ? 'bg-primary/20 text-primary border border-primary/30' : 'hover:bg-muted'
                        }`}
                      >
                        <ThumbsUp className={`w-4 h-4 ${hasVotedHelpful ? 'fill-primary' : ''}`} />
                        <span className="font-bold">{review.helpful}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVote(review._id, false)}
                        className={`rounded-full h-10 px-4 flex items-center gap-2 transition-all ${
                          hasVotedNotHelpful ? 'bg-destructive/20 text-destructive border border-destructive/30' : 'hover:bg-muted'
                        }`}
                      >
                        <ThumbsDown className={`w-4 h-4 ${hasVotedNotHelpful ? 'fill-destructive' : ''}`} />
                        <span className="font-bold">{review.notHelpful}</span>
                      </Button>
                    </div>
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


