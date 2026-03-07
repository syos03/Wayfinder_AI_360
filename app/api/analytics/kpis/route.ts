import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { User, Destination, Review, SearchHistory, DestinationView } from '@/lib/models';
import { checkAdmin } from '@/lib/middleware/admin';

/**
 * GET /api/analytics/kpis
 * Get Key Performance Indicators (KPIs) for admin dashboard
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const adminCheck = await checkAdmin(request);
    if (!adminCheck.authorized) {
      return NextResponse.json(
        { success: false, error: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    await connectDB();

    // Get date ranges
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const last7Days = new Date(today);
    last7Days.setDate(last7Days.getDate() - 7);
    const last30Days = new Date(today);
    last30Days.setDate(last30Days.getDate() - 30);

    // Parallel KPI queries for performance
    const [
      totalUsers,
      activeUsersToday,
      activeUsersLast7Days,
      activeUsersLast30Days,
      newUsersToday,
      newUsersLast7Days,
      newUsersLast30Days,
      totalDestinations,
      activeDestinations,
      totalReviews,
      reviewsToday,
      reviewsLast7Days,
      reviewsLast30Days,
      avgRating,
      totalViews,
      viewsToday,
      viewsLast7Days,
      totalSearches,
      searchesToday,
      searchesLast7Days,
    ] = await Promise.all([
      // User metrics
      User.countDocuments(),
      User.countDocuments({ lastActive: { $gte: today } }),
      User.countDocuments({ lastActive: { $gte: last7Days } }),
      User.countDocuments({ lastActive: { $gte: last30Days } }),
      User.countDocuments({ createdAt: { $gte: today } }),
      User.countDocuments({ createdAt: { $gte: last7Days } }),
      User.countDocuments({ createdAt: { $gte: last30Days } }),

      // Destination metrics
      Destination.countDocuments(),
      Destination.countDocuments({ isActive: true }),

      // Review metrics
      Review.countDocuments({ status: 'approved' }),
      Review.countDocuments({ createdAt: { $gte: today }, status: 'approved' }),
      Review.countDocuments({ createdAt: { $gte: last7Days }, status: 'approved' }),
      Review.countDocuments({ createdAt: { $gte: last30Days }, status: 'approved' }),

      // Average rating
      Review.aggregate([
        { $match: { status: 'approved' } },
        { $group: { _id: null, avgRating: { $avg: '$rating' } } },
      ]).then((result) => result[0]?.avgRating || 0),

      // View metrics
      DestinationView.countDocuments(),
      DestinationView.countDocuments({ viewedAt: { $gte: today } }),
      DestinationView.countDocuments({ viewedAt: { $gte: last7Days } }),

      // Search metrics
      SearchHistory.countDocuments(),
      SearchHistory.countDocuments({ createdAt: { $gte: today } }),
      SearchHistory.countDocuments({ createdAt: { $gte: last7Days } }),
    ]);

    // Calculate DAU/MAU ratio (stickiness)
    const stickiness = activeUsersLast30Days > 0 
      ? ((activeUsersToday / activeUsersLast30Days) * 100).toFixed(1)
      : '0.0';

    // User growth rate (last 7 days vs previous 7 days)
    const previous14to7Days = new Date(last7Days);
    previous14to7Days.setDate(previous14to7Days.getDate() - 7);
    const usersPrevious7Days = await User.countDocuments({
      createdAt: { $gte: previous14to7Days, $lt: last7Days },
    });
    const userGrowthRate = usersPrevious7Days > 0
      ? (((newUsersLast7Days - usersPrevious7Days) / usersPrevious7Days) * 100).toFixed(1)
      : newUsersLast7Days > 0 ? '100.0' : '0.0';

    // Review growth rate
    const reviewsPrevious7Days = await Review.countDocuments({
      createdAt: { $gte: previous14to7Days, $lt: last7Days },
      status: 'approved',
    });
    const reviewGrowthRate = reviewsPrevious7Days > 0
      ? (((reviewsLast7Days - reviewsPrevious7Days) / reviewsPrevious7Days) * 100).toFixed(1)
      : reviewsLast7Days > 0 ? '100.0' : '0.0';

    // Average reviews per user
    const avgReviewsPerUser = totalUsers > 0 ? (totalReviews / totalUsers).toFixed(2) : '0.00';

    // CTR (Click-through rate) - clicks / views
    const totalClicks = await Destination.aggregate([
      { $group: { _id: null, totalClicks: { $sum: '$clicks' } } },
    ]).then((result) => result[0]?.totalClicks || 0);
    
    const ctr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(2) : '0.00';

    // Return KPIs
    return NextResponse.json({
      success: true,
      data: {
        // User KPIs
        users: {
          total: totalUsers,
          dau: activeUsersToday,
          wau: activeUsersLast7Days, // Weekly active users
          mau: activeUsersLast30Days,
          stickiness: parseFloat(stickiness), // DAU/MAU %
          newToday: newUsersToday,
          newLast7Days: newUsersLast7Days,
          newLast30Days: newUsersLast30Days,
          growthRate: parseFloat(userGrowthRate), // % change vs previous period
        },

        // Destination KPIs
        destinations: {
          total: totalDestinations,
          active: activeDestinations,
          inactive: totalDestinations - activeDestinations,
        },

        // Review KPIs
        reviews: {
          total: totalReviews,
          today: reviewsToday,
          last7Days: reviewsLast7Days,
          last30Days: reviewsLast30Days,
          averageRating: parseFloat(avgRating.toFixed(2)),
          avgPerUser: parseFloat(avgReviewsPerUser),
          growthRate: parseFloat(reviewGrowthRate),
        },

        // Engagement KPIs
        engagement: {
          totalViews: totalViews,
          viewsToday: viewsToday,
          viewsLast7Days: viewsLast7Days,
          totalSearches: totalSearches,
          searchesToday: searchesToday,
          searchesLast7Days: searchesLast7Days,
          totalClicks: totalClicks,
          ctr: parseFloat(ctr), // Click-through rate %
        },
      },
    });
  } catch (error: any) {
    console.error('❌ Get KPIs error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

