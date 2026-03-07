'use client'

/**
 * Admin Reviews Management Page
 * For moderating user reviews
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Star,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Trash2,
  Eye,
  Loader2,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { toast } from 'sonner'

interface Review {
  _id: string
  destinationId: {
    _id: string
    name: string
    province: string
  }
  userName: string
  userAvatar?: string
  rating: number
  title: string
  content: string
  photos: string[]
  helpful: number
  notHelpful: number
  isApproved: boolean
  isRejected: boolean
  moderatorNotes?: string
  createdAt: string
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('pending')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [moderatorNotes, setModeratorNotes] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchReviews()
  }, [status, search, page])

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        status,
        page: page.toString(),
        limit: '20',
        ...(search && { search }),
      })

      const res = await fetch(`/api/admin/reviews?${params}`, {
        credentials: 'include',
      })
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

  const handleAction = async (reviewId: string, action: 'approve' | 'reject') => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          moderatorNotes,
        }),
        credentials: 'include',
      })

      const data = await res.json()

      if (res.ok) {
        toast.success(data.message)
        setSelectedReview(null)
        setModeratorNotes('')
        fetchReviews()
      } else {
        toast.error(data.error || 'Có lỗi xảy ra')
      }
    } catch (err) {
      toast.error('Không thể thực hiện hành động')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async (reviewId: string) => {
    setActionLoading(true)
    
    toast.promise(
      fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'DELETE',
        credentials: 'include',
      }).then(async (res) => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Có lỗi xảy ra')
        setSelectedReview(null)
        fetchReviews()
        setActionLoading(false)
        return data
      }),
      {
        loading: 'Đang xóa đánh giá...',
        success: (data) => data.message || 'Xóa đánh giá thành công!',
        error: (err) => err.message || 'Không thể xóa đánh giá',
      }
    )
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Quản lý đánh giá</h1>
        <p className="text-gray-600">Kiểm duyệt và quản lý đánh giá từ người dùng</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Tổng đánh giá</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Chờ duyệt</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Đã duyệt</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Đã từ chối</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm theo tiêu đề, nội dung, tên người dùng..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              {[
                { value: 'all', label: 'Tất cả', color: 'default' },
                { value: 'pending', label: 'Chờ duyệt', color: 'yellow' },
                { value: 'approved', label: 'Đã duyệt', color: 'green' },
                { value: 'rejected', label: 'Đã từ chối', color: 'red' },
              ].map((item) => (
                <Button
                  key={item.value}
                  variant={status === item.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setStatus(item.value)
                    setPage(1)
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-600 py-8">Không có đánh giá nào</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review._id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  {/* User Avatar */}
                  <Avatar>
                    <AvatarImage src={review.userAvatar} />
                    <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
                  </Avatar>

                  {/* Content */}
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-medium">{review.userName}</span>
                          {renderStars(review.rating)}
                        </div>
                        <p className="text-sm text-gray-500">
                          {formatDistanceToNow(new Date(review.createdAt), {
                            addSuffix: true,
                            locale: vi,
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {review.isApproved && (
                          <Badge className="bg-green-100 text-green-800">Đã duyệt</Badge>
                        )}
                        {review.isRejected && (
                          <Badge className="bg-red-100 text-red-800">Đã từ chối</Badge>
                        )}
                        {!review.isApproved && !review.isRejected && (
                          <Badge className="bg-yellow-100 text-yellow-800">Chờ duyệt</Badge>
                        )}
                      </div>
                    </div>

                    {/* Destination */}
                    <div className="mb-3">
                      <span className="text-sm text-gray-600">Điểm đến: </span>
                      <span className="text-sm font-medium">
                        {review.destinationId.name}, {review.destinationId.province}
                      </span>
                    </div>

                    {/* Review Content */}
                    <h3 className="font-semibold mb-2">{review.title}</h3>
                    <p className="text-gray-700 mb-3">{review.content}</p>

                    {/* Photos */}
                    {review.photos.length > 0 && (
                      <div className="grid grid-cols-4 gap-2 mb-3">
                        {review.photos.map((photo, idx) => (
                          <img
                            key={idx}
                            src={photo}
                            alt={`Review photo ${idx + 1}`}
                            className="w-full h-20 object-cover rounded"
                          />
                        ))}
                      </div>
                    )}

                    {/* Moderator Notes */}
                    {review.moderatorNotes && (
                      <div className="bg-gray-50 p-3 rounded mb-3">
                        <p className="text-sm text-gray-600">
                          <strong>Ghi chú:</strong> {review.moderatorNotes}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedReview(review)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Chi tiết
                      </Button>
                      {!review.isApproved && !review.isRejected && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleAction(review._id, 'approve')}
                            className="bg-green-600 hover:bg-green-700"
                            disabled={actionLoading}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Duyệt
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedReview(review)
                              setModeratorNotes('')
                            }}
                            disabled={actionLoading}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Từ chối
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(review._id)}
                        disabled={actionLoading}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Xóa
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
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

      {/* Review Detail Dialog */}
      {selectedReview && (
        <Dialog open={!!selectedReview} onOpenChange={() => setSelectedReview(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Chi tiết đánh giá</DialogTitle>
              <DialogDescription>
                Kiểm duyệt và quản lý đánh giá
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* User & Rating */}
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={selectedReview.userAvatar} />
                  <AvatarFallback>{selectedReview.userName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedReview.userName}</p>
                  <div className="flex items-center gap-2">
                    {renderStars(selectedReview.rating)}
                    <span className="text-sm text-gray-600">
                      ({selectedReview.rating}/5)
                    </span>
                  </div>
                </div>
              </div>

              {/* Destination */}
              <div>
                <label className="text-sm font-medium">Điểm đến:</label>
                <p className="text-gray-700">
                  {selectedReview.destinationId.name}, {selectedReview.destinationId.province}
                </p>
              </div>

              {/* Title */}
              <div>
                <label className="text-sm font-medium">Tiêu đề:</label>
                <p className="text-gray-700">{selectedReview.title}</p>
              </div>

              {/* Content */}
              <div>
                <label className="text-sm font-medium">Nội dung:</label>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedReview.content}</p>
              </div>

              {/* Photos */}
              {selectedReview.photos.length > 0 && (
                <div>
                  <label className="text-sm font-medium">Hình ảnh:</label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {selectedReview.photos.map((photo, idx) => (
                      <img
                        key={idx}
                        src={photo}
                        alt={`Review photo ${idx + 1}`}
                        className="w-full h-32 object-cover rounded"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Moderator Notes */}
              {!selectedReview.isApproved && !selectedReview.isRejected && (
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Ghi chú kiểm duyệt (Tùy chọn):
                  </label>
                  <Textarea
                    value={moderatorNotes}
                    onChange={(e) => setModeratorNotes(e.target.value)}
                    placeholder="Lý do từ chối hoặc ghi chú..."
                    rows={3}
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                {!selectedReview.isApproved && !selectedReview.isRejected && (
                  <>
                    <Button
                      onClick={() => handleAction(selectedReview._id, 'approve')}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      disabled={actionLoading}
                    >
                      {actionLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Duyệt đánh giá
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => handleAction(selectedReview._id, 'reject')}
                      variant="outline"
                      className="flex-1"
                      disabled={actionLoading}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Từ chối
                    </Button>
                  </>
                )}
                <Button
                  onClick={() => handleDelete(selectedReview._id)}
                  variant="outline"
                  className="text-red-600"
                  disabled={actionLoading}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Xóa
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}


