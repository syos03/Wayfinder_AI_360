/**
 * GET /api/profile/[userId]
 * Get public user profile
 */

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongodb'
import User from '@/lib/models/User'
import Review from '@/lib/models/Review'
import mongoose from 'mongoose'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await connectDB()
    const { userId } = await params

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
    }

    const user = await User.findById(userId).select(
      '-passwordHash -permissions -bannedBy -loginCount'
    )

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const recentReviews = await Review.find({
      userId: new mongoose.Types.ObjectId(userId),
      isApproved: true,
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('destinationId', 'name slug images')
      .lean()

    const followersCount = user.stats?.followersCount ?? user.followers?.length ?? 0
    const followingCount = user.stats?.followingCount ?? user.following?.length ?? 0

    return NextResponse.json({
      success: true,
      data: {
        ...user.toObject(),
        stats: {
          ...user.stats,
          reviewsCount: user.stats?.reviewsCount ?? 0,
          followersCount,
          followingCount,
          destinationsVisited: user.stats?.destinationsVisited ?? 0,
        },
        recentReviews,
      },
    })
  } catch (error: any) {
    console.error('Get profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
