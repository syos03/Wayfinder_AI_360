import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { User, SearchHistory, DestinationView, Review } from '@/lib/models';
import { checkAdmin } from '@/lib/middleware/admin';

/**
 * GET /api/analytics/conversion-funnel
 * Get conversion funnel metrics
 * Query params: period (7d, 30d, 90d)
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

    // Get period from query
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';

    // Calculate date range
    const now = new Date();
    let daysBack = 30;
    if (period === '7d') daysBack = 7;
    else if (period === '90d') daysBack = 90;

    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - daysBack);

    // Get funnel metrics
    const [
      totalVisitors,
      totalSearches,
      uniqueSearchers,
      totalViews,
      uniqueViewers,
      totalReviews,
      uniqueReviewers,
    ] = await Promise.all([
      // Total registered users in period
      User.countDocuments({ createdAt: { $gte: startDate } }),
      
      // Total searches
      SearchHistory.countDocuments({ createdAt: { $gte: startDate } }),
      
      // Unique users who searched
      SearchHistory.distinct('userId', { 
        createdAt: { $gte: startDate },
        userId: { $ne: null },
      }).then(ids => ids.length),
      
      // Total views
      DestinationView.countDocuments({ viewedAt: { $gte: startDate } }),
      
      // Unique users who viewed
      DestinationView.distinct('userId', { 
        viewedAt: { $gte: startDate },
        userId: { $ne: null },
      }).then(ids => ids.length),
      
      // Total reviews
      Review.countDocuments({ 
        createdAt: { $gte: startDate },
        status: 'approved',
      }),
      
      // Unique users who reviewed
      Review.distinct('userId', { 
        createdAt: { $gte: startDate },
        status: 'approved',
      }).then(ids => ids.length),
    ]);

    // Calculate conversion rates
    const searchConversion = totalVisitors > 0 
      ? ((uniqueSearchers / totalVisitors) * 100).toFixed(1)
      : '0.0';

    const viewConversion = uniqueSearchers > 0
      ? ((uniqueViewers / uniqueSearchers) * 100).toFixed(1)
      : '0.0';

    const reviewConversion = uniqueViewers > 0
      ? ((uniqueReviewers / uniqueViewers) * 100).toFixed(1)
      : '0.0';

    const overallConversion = totalVisitors > 0
      ? ((uniqueReviewers / totalVisitors) * 100).toFixed(1)
      : '0.0';

    return NextResponse.json({
      success: true,
      data: {
        period: period,
        funnel: [
          {
            stage: 'Đăng ký',
            users: totalVisitors,
            percentage: 100,
            dropoff: 0,
          },
          {
            stage: 'Tìm kiếm',
            users: uniqueSearchers,
            percentage: parseFloat(searchConversion),
            dropoff: totalVisitors - uniqueSearchers,
          },
          {
            stage: 'Xem điểm đến',
            users: uniqueViewers,
            percentage: parseFloat(viewConversion),
            dropoff: uniqueSearchers - uniqueViewers,
          },
          {
            stage: 'Đánh giá',
            users: uniqueReviewers,
            percentage: parseFloat(reviewConversion),
            dropoff: uniqueViewers - uniqueReviewers,
          },
        ],
        summary: {
          totalVisitors,
          totalSearches,
          totalViews,
          totalReviews,
          overallConversion: parseFloat(overallConversion),
        },
      },
    });
  } catch (error: any) {
    console.error('❌ Get conversion funnel error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

