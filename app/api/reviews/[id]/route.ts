/**
 * Individual Review API
 * GET: Get single review
 * PATCH: Update review (owner only)
 * DELETE: Delete review (owner only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongodb'
import Review from '@/lib/models/Review'
import { getCurrentUser } from '@/lib/auth/server-auth'
import mongoose from 'mongoose'

// GET /api/reviews/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params

    const review = await Review.findById(id)

    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy đánh giá' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { review },
    })
  } catch (error: any) {
    console.error('Error fetching review:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể tải đánh giá' },
      { status: 500 }
    )
  }
}

// PATCH /api/reviews/[id]
export async function PATCH(
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
        { success: false, error: 'Vui lòng đăng nhập' },
        { status: 401 }
      )
    }

    const review = await Review.findById(id)

    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy đánh giá' },
        { status: 404 }
      )
    }

    // Check ownership
    if (review.userId.toString() !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Bạn không có quyền chỉnh sửa đánh giá này' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { rating, title, content, photos } = body

    // Update fields
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return NextResponse.json(
          { success: false, error: 'Đánh giá phải từ 1-5 sao' },
          { status: 400 }
        )
      }
      review.rating = rating
    }
    if (title !== undefined) review.title = title.trim()
    if (content !== undefined) review.content = content.trim()
    if (photos !== undefined) review.photos = photos

    // Reset approval status when edited
    review.isApproved = false
    review.isRejected = false

    await review.save()

    return NextResponse.json({
      success: true,
      data: { review },
      message: 'Đánh giá đã được cập nhật và đang chờ duyệt lại',
    })
  } catch (error: any) {
    console.error('Error updating review:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể cập nhật đánh giá' },
      { status: 500 }
    )
  }
}

// DELETE /api/reviews/[id]
export async function DELETE(
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
        { success: false, error: 'Vui lòng đăng nhập' },
        { status: 401 }
      )
    }

    const review = await Review.findById(id)

    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy đánh giá' },
        { status: 404 }
      )
    }

    // Check ownership
    if (review.userId.toString() !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Bạn không có quyền xóa đánh giá này' },
        { status: 403 }
      )
    }

    await review.deleteOne()

    return NextResponse.json({
      success: true,
      message: 'Đã xóa đánh giá',
    })
  } catch (error: any) {
    console.error('Error deleting review:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể xóa đánh giá' },
      { status: 500 }
    )
  }
}


