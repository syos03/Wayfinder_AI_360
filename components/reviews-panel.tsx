"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, ThumbsUp, MessageSquare } from "lucide-react"

interface ReviewsPanelProps {
  locationId: string
}

interface Review {
  id: string
  author: string
  rating: number
  date: string
  content: string
  helpful: number
}

const sampleReviews: Review[] = [
  {
    id: "1",
    author: "Nguyễn Văn A",
    rating: 5,
    date: "2024-12-15",
    content: "Cảnh đẹp tuyệt vời, rất đáng để ghé thăm! Thời tiết rất dễ chịu và người dân thân thiện.",
    helpful: 12
  },
  {
    id: "2",
    author: "Trần Thị B",
    rating: 4,
    date: "2024-11-20",
    content: "Điểm đến tuyệt vời cho gia đình. Có nhiều hoạt động thú vị cho trẻ em. Ẩm thực cũng rất phong phú.",
    helpful: 8
  },
  {
    id: "3",
    author: "Lê Minh C",
    rating: 5,
    date: "2024-10-05",
    content: "Lần thứ 3 quay lại và vẫn không thất vọng. Mỗi lần đến lại khám phá được điều mới mẻ.",
    helpful: 15
  }
]

export function ReviewsPanel({ locationId }: ReviewsPanelProps) {
  const [reviews] = useState<Review[]>(sampleReviews)

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ))
  }

  const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            Đánh giá từ du khách
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold text-blue-600">
              {averageRating.toFixed(1)}
            </div>
            <div>
              <div className="flex items-center gap-1">
                {renderStars(Math.round(averageRating))}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {reviews.length} đánh giá
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id} className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900">{review.author}</h4>
                  <p className="text-sm text-gray-500">
                    {new Date(review.date).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {renderStars(review.rating)}
                </div>
              </div>
              <p className="text-gray-700 mb-4">{review.content}</p>
              <Button variant="ghost" size="sm" className="text-gray-500">
                <ThumbsUp className="w-4 h-4 mr-2" />
                Hữu ích ({review.helpful})
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
