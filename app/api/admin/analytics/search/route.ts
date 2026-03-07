import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { SearchHistory, Destination } from '@/lib/models';
import { getCurrentUser } from '@/lib/auth/server-auth';

/**
 * GET /api/admin/analytics/search
 * Get search analytics for admin dashboard
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'Admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d'; // 7d, 30d, 90d

    const daysAgo = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysAgo);

    // Top search queries
    const topQueries = await SearchHistory.aggregate([
      { $match: { createdAt: { $gte: cutoffDate } } },
      {
        $group: {
          _id: '$query',
          count: { $sum: 1 },
          avgResults: { $avg: '$resultsCount' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]);

    // Zero-result searches (to improve content)
    const zeroResultQueries = await SearchHistory.aggregate([
      {
        $match: {
          createdAt: { $gte: cutoffDate },
          resultsCount: 0,
        },
      },
      {
        $group: {
          _id: '$query',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Popular filters
    const popularFilters = await SearchHistory.aggregate([
      { $match: { createdAt: { $gte: cutoffDate } } },
      {
        $group: {
          _id: {
            region: '$filters.region',
            type: '$filters.type',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Search trends by day
    const searchTrends = await SearchHistory.aggregate([
      { $match: { createdAt: { $gte: cutoffDate } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Total searches
    const totalSearches = await SearchHistory.countDocuments({
      createdAt: { $gte: cutoffDate },
    });

    // Unique users who searched
    const uniqueSearchers = await SearchHistory.distinct('userId', {
      createdAt: { $gte: cutoffDate },
      userId: { $exists: true, $ne: null },
    });

    // Click-through rate
    const searchesWithClicks = await SearchHistory.countDocuments({
      createdAt: { $gte: cutoffDate },
      'clickedDestinations.0': { $exists: true },
    });

    const ctr = totalSearches > 0 ? (searchesWithClicks / totalSearches) * 100 : 0;

    return NextResponse.json({
      success: true,
      data: {
        period,
        summary: {
          totalSearches,
          uniqueSearchers: uniqueSearchers.length,
          clickThroughRate: ctr.toFixed(2),
          zeroResultCount: zeroResultQueries.reduce((sum: number, q: any) => sum + q.count, 0),
        },
        topQueries,
        zeroResultQueries,
        popularFilters,
        searchTrends,
      },
    });
  } catch (error: any) {
    console.error('❌ Get search analytics error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

