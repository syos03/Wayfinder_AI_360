/**
 * Review Helpful Vote API
 * POST: Vote review as helpful or not helpful
 */

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongodb'
import Review from '@/lib/models/Review'
import { getCurrentUser } from '@/lib/auth/server-auth'
import mongoose from 'mongoose'

// POST /api/reviews/[id]/helpful
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params

    // Check authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng đăng nhập để vote' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { isHelpful } = body // true for helpful, false for not helpful

    if (isHelpful === undefined) {
      return NextResponse.json(
        { success: false, error: 'isHelpful is required' },
        { status: 400 }
      )
    }

    const review = await Review.findById(id)

    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy đánh giá' },
        { status: 404 }
      )
    }

    // Check if user is the review owner
    if (review.userId.toString() === user.id) {
      return NextResponse.json(
        { success: false, error: 'Bạn không thể vote cho đánh giá của chính mình' },
        { status: 400 }
      )
    }

    const userId = user.id
    const userObjectId = new mongoose.Types.ObjectId(userId)

    // Remove from opposite array if exists
    if (isHelpful) {
      // Voting helpful
      const notHelpfulIndex = review.notHelpfulBy.findIndex(id => id.toString() === userId)
      if (notHelpfulIndex > -1) {
        review.notHelpfulBy.splice(notHelpfulIndex, 1)
        review.notHelpful = Math.max(0, review.notHelpful - 1)
      }

      // Toggle helpful
      const helpfulIndex = review.helpfulBy.findIndex(id => id.toString() === userId)
      if (helpfulIndex > -1) {
        // Already voted helpful, remove vote
        review.helpfulBy.splice(helpfulIndex, 1)
        review.helpful = Math.max(0, review.helpful - 1)
      } else {
        // Add helpful vote
        review.helpfulBy.push(userObjectId)
        review.helpful += 1
      }
    } else {
      // Voting not helpful
      const helpfulIndex = review.helpfulBy.findIndex(id => id.toString() === userId)
      if (helpfulIndex > -1) {
        review.helpfulBy.splice(helpfulIndex, 1)
        review.helpful = Math.max(0, review.helpful - 1)
      }

      // Toggle not helpful
      const notHelpfulIndex = review.notHelpfulBy.findIndex(id => id.toString() === userId)
      if (notHelpfulIndex > -1) {
        // Already voted not helpful, remove vote
        review.notHelpfulBy.splice(notHelpfulIndex, 1)
        review.notHelpful = Math.max(0, review.notHelpful - 1)
      } else {
        // Add not helpful vote
        review.notHelpfulBy.push(userObjectId)
        review.notHelpful += 1
      }
    }

    await review.save()

    return NextResponse.json({
      success: true,
      data: {
        helpful: review.helpful,
        notHelpful: review.notHelpful,
      },
      message: 'Vote đã được ghi nhận',
    })
  } catch (error: any) {
    console.error('Error voting review:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể vote' },
      { status: 500 }
    )
  }
}


