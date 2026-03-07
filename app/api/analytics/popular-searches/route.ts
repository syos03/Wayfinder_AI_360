import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { SearchHistory } from '@/lib/models';
import { checkAdmin } from '@/lib/middleware/admin';

/**
 * GET /api/analytics/popular-searches
 * Get popular search terms
 * Query params: limit (default 10), period (7d, 30d, 90d)
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

    // Get query params
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const period = searchParams.get('period') || '30d';

    // Calculate date range
    const now = new Date();
    let daysBack = 30;
    if (period === '7d') daysBack = 7;
    else if (period === '90d') daysBack = 90;

    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - daysBack);

    // Aggregate popular search terms
    const popularSearches = await SearchHistory.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          query: { $exists: true, $ne: '' },
        },
      },
      {
        $group: {
          _id: { $toLower: '$query' },
          count: { $sum: 1 },
          avgResults: { $avg: '$resultsCount' },
          totalClicks: { $sum: { $size: '$clickedDestinations' } },
        },
      },
      { $sort: { count: -1 } },
      { $limit: limit },
    ]);

    // Format response
    const formatted = popularSearches.map((item, index) => ({
      rank: index + 1,
      term: item._id,
      searches: item.count,
      avgResults: Math.round(item.avgResults),
      totalClicks: item.totalClicks,
      ctr: item.count > 0 ? ((item.totalClicks / item.count) * 100).toFixed(1) : '0.0',
    }));

    return NextResponse.json({
      success: true,
      data: {
        period: period,
        searches: formatted,
      },
    });
  } catch (error: any) {
    console.error('❌ Get popular searches error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

