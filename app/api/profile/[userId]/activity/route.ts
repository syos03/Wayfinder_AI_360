/**
 * GET /api/profile/[userId]/activity
 * Get user's activity feed
 */

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongodb'
import User from '@/lib/models/User'
import Review from '@/lib/models/Review'
import mongoose from 'mongoose'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await connectDB()
    const { userId } = await params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
    }

    const skip = (page - 1) * limit
    const activities: any[] = []

    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const reviews = await Review.find({
      userId: new mongoose.Types.ObjectId(userId),
      isApproved: true,
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('destinationId', 'name slug images')
      .lean()

    reviews.forEach((review) => {
      activities.push({
        type: 'review',
        action: 'created_review',
        data: {
          review: {
            _id: review._id,
            title: review.title,
            rating: review.rating,
            destination: review.destinationId,
          },
        },
        createdAt: review.createdAt,
      })
    })

    if (user.followers && user.followers.length > 0) {
      const recentFollowers = await User.find({
        _id: { $in: user.followers.slice(-5) },
      })
        .select('name avatar')
        .lean()

      recentFollowers.forEach((follower) => {
        activities.push({
          type: 'social',
          action: 'new_follower',
          data: { user: follower },
          createdAt: new Date(),
        })
      })
    }

    if (user.badges && user.badges.length > 0) {
      user.badges.slice(0, 3).forEach((badge: string) => {
        activities.push({
          type: 'achievement',
          action: 'earned_badge',
          data: { badge },
          createdAt: user.updatedAt,
        })
      })
    }

    activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    const total = activities.length
    const paginatedActivities = activities.slice(skip, skip + limit)

    return NextResponse.json({
      success: true,
      data: {
        activities: paginatedActivities,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error: any) {
    console.error('Get activity error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
