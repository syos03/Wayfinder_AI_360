/**
 * Update User Stats & Badges
 * Called after important actions (review, visit, etc.)
 */

import User from '../models/User';
import Review from '../models/Review';
import { calculateBadges } from './badges';
import mongoose from 'mongoose';

/**
 * Recalculate and update user stats
 */
export async function updateUserStats(userId: string | mongoose.Types.ObjectId) {
  try {
    const userObjectId = typeof userId === 'string' 
      ? new mongoose.Types.ObjectId(userId)
      : userId;

    // Count reviews
    const reviewsCount = await Review.countDocuments({
      userId: userObjectId,
      isApproved: true,
    });

    // Get unique destination IDs from reviews
    const reviews = await Review.find({
      userId: userObjectId,
      isApproved: true,
    }).distinct('destinationId');
    const destinationsVisited = reviews.length;

    // Get follower/following counts
    const user = await User.findById(userObjectId);
    if (!user) {
      console.error('User not found:', userId);
      return;
    }

    const followersCount = user.followers?.length || 0;
    const followingCount = user.following?.length || 0;

    // Update stats
    const stats = {
      reviewsCount,
      destinationsVisited,
      followersCount,
      followingCount,
    };

    // Calculate badges
    const badges = calculateBadges(stats);

    // Update user
    await User.findByIdAndUpdate(userObjectId, {
      $set: {
        stats,
        badges,
      },
    });

    console.log('✅ Updated stats for user:', userId, stats);
  } catch (error) {
    console.error('❌ Error updating user stats:', error);
  }
}

