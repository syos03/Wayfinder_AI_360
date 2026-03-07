import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { Destination } from '@/lib/models';
import { checkAdmin } from '@/lib/middleware/admin';

/**
 * GET /api/analytics/destination-types
 * Get destination types distribution and statistics
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

    // Aggregate by type
    const typeStats = await Destination.aggregate([
      {
        $match: { isActive: true },
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalViews: { $sum: '$views' },
          totalReviews: { $sum: '$reviewCount' },
          avgRating: { $avg: '$rating' },
          totalClicks: { $sum: '$clicks' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Calculate totals for percentage
    const totalDestinations = typeStats.reduce((acc, item) => acc + item.count, 0);

    // Format response
    const formatted = typeStats.map((item) => ({
      type: item._id,
      count: item.count,
      percentage: ((item.count / totalDestinations) * 100).toFixed(1),
      views: item.totalViews || 0,
      reviews: item.totalReviews || 0,
      avgRating: item.avgRating ? parseFloat(item.avgRating.toFixed(2)) : 0,
      clicks: item.totalClicks || 0,
    }));

    return NextResponse.json({
      success: true,
      data: {
        types: formatted,
        total: totalDestinations,
      },
    });
  } catch (error: any) {
    console.error('❌ Get destination types error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

