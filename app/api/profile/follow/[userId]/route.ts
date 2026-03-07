/**
 * POST /api/profile/follow/[userId]
 * Follow/Unfollow a user
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import User from '@/lib/models/User';
import { getCurrentUser } from '@/lib/auth/server-auth';
import mongoose from 'mongoose';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await connectDB();
    
    // Get current user
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { userId } = await params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Can't follow yourself
    if (userId === currentUser.id) {
      return NextResponse.json(
        { error: 'Cannot follow yourself' },
        { status: 400 }
      );
    }

    // Check if target user exists
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if already following
    const user = await User.findById(currentUser.id);
    if (!user) {
      return NextResponse.json(
        { error: 'Current user not found' },
        { status: 404 }
      );
    }

    const targetObjectId = new mongoose.Types.ObjectId(userId);
    const isFollowing = user.following.some(id => id.equals(targetObjectId));

    if (isFollowing) {
      // UNFOLLOW
      await User.findByIdAndUpdate(currentUser.id, {
        $pull: { following: targetObjectId },
        $inc: { 'stats.followingCount': -1 }
      });

      await User.findByIdAndUpdate(userId, {
        $pull: { followers: new mongoose.Types.ObjectId(currentUser.id) },
        $inc: { 'stats.followersCount': -1 }
      });

      return NextResponse.json({
        success: true,
        message: 'Unfollowed successfully',
        data: { isFollowing: false },
      });
    } else {
      // FOLLOW
      await User.findByIdAndUpdate(currentUser.id, {
        $addToSet: { following: targetObjectId },
        $inc: { 'stats.followingCount': 1 }
      });

      await User.findByIdAndUpdate(userId, {
        $addToSet: { followers: new mongoose.Types.ObjectId(currentUser.id) },
        $inc: { 'stats.followersCount': 1 }
      });

      return NextResponse.json({
        success: true,
        message: 'Followed successfully',
        data: { isFollowing: true },
      });
    }
  } catch (error: any) {
    console.error('❌ Follow/Unfollow error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

