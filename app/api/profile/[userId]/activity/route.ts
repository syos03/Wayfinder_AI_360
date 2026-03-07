/**
 * GET /api/profile/[userId]/activity
 * Get user's activity feed
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import User from '@/lib/models/User';
import Review from '@/lib/models/Review';
import Destination from '@/lib/models/Destination';  // ⭐ NEEDED FOR POPULATE
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await connectDB();
    const { userId } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const skip = (page - 1) * limit;
    const activities: any[] = [];

    // Get user to check existence
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // 1. Recent reviews
    const reviews = await Review.find({
      userId: new mongoose.Types.ObjectId(userId),
      isApproved: true,
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('destinationId', 'name slug images')
      .lean();

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
      });
    });

    // 2. New followers (recent 5)
    if (user.followers && user.followers.length > 0) {
      const recentFollowers = await User.find({
        _id: { $in: user.followers.slice(-5) },
      })
        .select('name avatar')
        .lean();

      recentFollowers.forEach((follower) => {
        activities.push({
          type: 'social',
          action: 'new_follower',
          data: {
            user: follower,
          },
          createdAt: new Date(), // We don't have exact timestamp, use current
        });
      });
    }

    // 3. Badge achievements
    if (user.badges && user.badges.length > 0) {
      user.badges.slice(0, 3).forEach((badge) => {
        activities.push({
          type: 'achievement',
          action: 'earned_badge',
          data: {
            badge,
          },
          createdAt: user.updatedAt,
        });
      });
    }

    // Sort by date
    activities.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Paginate
    const total = activities.length;
    const paginatedActivities = activities.slice(skip, skip + limit);

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
    });
  } catch (error: any) {
    console.error('❌ Get activity error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

