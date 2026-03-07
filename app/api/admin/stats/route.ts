/**
 * Admin Statistics API
 * GET /api/admin/stats - Get dashboard statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { User, Destination, Review } from '@/lib/models';
import { requireAdmin } from '@/lib/middleware/admin';

/**
 * GET /api/admin/stats
 * Get dashboard statistics
 */
export async function GET(req: NextRequest) {
  const { user, error } = await requireAdmin(req);
  if (error) return error;

  try {
    await connectDB();

    // Get date ranges
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const last7Days = new Date(today);
    last7Days.setDate(last7Days.getDate() - 7);
    const last30Days = new Date(today);
    last30Days.setDate(last30Days.getDate() - 30);

    // User stats
    const [
      totalUsers,
      activeUsers,
      bannedUsers,
      newUsersToday,
      newUsersLast7Days,
      newUsersLast30Days,
      usersByRole,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true, isBanned: false }),
      User.countDocuments({ isBanned: true }),
      User.countDocuments({ createdAt: { $gte: today } }),
      User.countDocuments({ createdAt: { $gte: last7Days } }),
      User.countDocuments({ createdAt: { $gte: last30Days } }),
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } },
      ]),
    ]);

    // Destination stats
    const [
      totalDestinations,
      activeDestinations,
      destinationsByRegion,
    ] = await Promise.all([
      Destination.countDocuments(),
      Destination.countDocuments({ isActive: true }),
      Destination.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$region', count: { $sum: 1 } } },
      ]),
    ]);

    // Review stats
    const [
      totalReviews,
      reviewsToday,
      reviewsLast7Days,
      reviewsLast30Days,
      averageRating,
    ] = await Promise.all([
      Review.countDocuments(),
      Review.countDocuments({ createdAt: { $gte: today } }),
      Review.countDocuments({ createdAt: { $gte: last7Days } }),
      Review.countDocuments({ createdAt: { $gte: last30Days } }),
      Review.aggregate([
        { $group: { _id: null, avgRating: { $avg: '$rating' } } },
      ]),
    ]);

    // Recent activity - last 10 users
    const recentUsers = await User.find()
      .select('name email role createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    // Most active users (by review count)
    const mostActiveUsers = await Review.aggregate([
      { $group: { _id: '$userId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          userId: '$_id',
          count: 1,
          name: '$user.name',
          email: '$user.email',
        },
      },
    ]);

    return NextResponse.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          banned: bannedUsers,
          newToday: newUsersToday,
          newLast7Days: newUsersLast7Days,
          newLast30Days: newUsersLast30Days,
          byRole: usersByRole,
        },
        destinations: {
          total: totalDestinations,
          active: activeDestinations,
          byRegion: destinationsByRegion,
        },
        reviews: {
          total: totalReviews,
          today: reviewsToday,
          last7Days: reviewsLast7Days,
          last30Days: reviewsLast30Days,
          averageRating: averageRating[0]?.avgRating || 0,
        },
        recentActivity: {
          recentUsers,
          mostActiveUsers,
        },
      },
    });

  } catch (error: any) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi server' },
      { status: 500 }
    );
  }
}

