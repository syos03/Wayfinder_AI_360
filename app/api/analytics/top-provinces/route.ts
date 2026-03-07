import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { Destination } from '@/lib/models';
import { checkAdmin } from '@/lib/middleware/admin';

/**
 * GET /api/analytics/top-provinces
 * Get top provinces by various metrics
 * Query params: sortBy (destinations, views, reviews), limit (default 10)
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
    const sortBy = searchParams.get('sortBy') || 'destinations';
    const limit = parseInt(searchParams.get('limit') || '10');

    // Aggregate by province
    const provinceStats = await Destination.aggregate([
      {
        $match: { isActive: true },
      },
      {
        $group: {
          _id: '$province',
          region: { $first: '$region' },
          destinationCount: { $sum: 1 },
          totalViews: { $sum: '$views' },
          totalReviews: { $sum: '$reviewCount' },
          avgRating: { $avg: '$rating' },
        },
      },
      {
        $sort: {
          destinationCount: sortBy === 'destinations' ? -1 : 1,
          totalViews: sortBy === 'views' ? -1 : 1,
          totalReviews: sortBy === 'reviews' ? -1 : 1,
        },
      },
      { $limit: limit },
    ]);

    // Format response
    const formatted = provinceStats.map((item, index) => ({
      rank: index + 1,
      province: item._id,
      region: item.region,
      destinations: item.destinationCount,
      views: item.totalViews || 0,
      reviews: item.totalReviews || 0,
      avgRating: item.avgRating ? parseFloat(item.avgRating.toFixed(2)) : 0,
    }));

    return NextResponse.json({
      success: true,
      data: {
        sortBy: sortBy,
        provinces: formatted,
      },
    });
  } catch (error: any) {
    console.error('❌ Get top provinces error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

