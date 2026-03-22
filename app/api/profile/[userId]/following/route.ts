/**
 * GET /api/profile/[userId]/following
 * Get user's following list
 */

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongodb'
import User from '@/lib/models/User'
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

    const user = await User.findById(userId).populate(
      'following',
      'name avatar bio stats.reviewsCount stats.followersCount'
    )

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: user.following || [],
    })
  } catch (error: any) {
    console.error('Get following error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
