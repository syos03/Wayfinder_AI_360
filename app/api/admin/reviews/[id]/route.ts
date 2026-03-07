/**
 * Admin Individual Review API
 * PATCH: Approve/Reject review, or update
 * DELETE: Delete review (admin)
 */

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongodb'
import Review from '@/lib/models/Review'
import { checkAdmin } from '@/lib/middleware/admin'
import { updateUserStats } from '@/lib/utils/updateUserStats'
import mongoose from 'mongoose'

// PATCH /api/admin/reviews/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin permissions
    const adminCheck = await checkAdmin(req, ['moderator', 'admin', 'super_admin'])
    if (!adminCheck.authorized) {
      return NextResponse.json(
        { success: false, error: adminCheck.error },
        { status: adminCheck.status }
      )
    }

    await connectDB()
    const { id } = await params

    const review = await Review.findById(id)

    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy đánh giá' },
        { status: 404 }
      )
    }

    const body = await req.json()
    const { action, moderatorNotes } = body

    if (action === 'approve') {
      review.isApproved = true
      review.isRejected = false
      review.moderatedBy = new mongoose.Types.ObjectId(adminCheck.user!.id)
      review.moderatedAt = new Date()
      if (moderatorNotes) review.moderatorNotes = moderatorNotes

      await review.save()

      // Update user stats and badges
      await updateUserStats(review.userId)

      return NextResponse.json({
        success: true,
        data: { review },
        message: 'Đã duyệt đánh giá',
      })
    } else if (action === 'reject') {
      review.isApproved = false
      review.isRejected = true
      review.moderatedBy = new mongoose.Types.ObjectId(adminCheck.user!.id)
      review.moderatedAt = new Date()
      if (moderatorNotes) review.moderatorNotes = moderatorNotes

      await review.save()

      // Update user stats and badges
      await updateUserStats(review.userId)

      return NextResponse.json({
        success: true,
        data: { review },
        message: 'Đã từ chối đánh giá',
      })
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('Admin review update error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update review' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/reviews/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin permissions (only admin and super_admin can delete)
    const adminCheck = await checkAdmin(req, ['admin', 'super_admin'])
    if (!adminCheck.authorized) {
      return NextResponse.json(
        { success: false, error: adminCheck.error },
        { status: adminCheck.status }
      )
    }

    await connectDB()
    const { id } = await params

    const review = await Review.findById(id)

    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy đánh giá' },
        { status: 404 }
      )
    }

    const userId = review.userId // Save before delete
    await review.deleteOne()

    // Update user stats and badges
    await updateUserStats(userId)

    return NextResponse.json({
      success: true,
      message: 'Đã xóa đánh giá',
    })
  } catch (error: any) {
    console.error('Admin review delete error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete review' },
      { status: 500 }
    )
  }
}


