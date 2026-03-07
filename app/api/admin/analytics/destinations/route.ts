import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { Destination, DestinationView } from '@/lib/models';
import { getCurrentUser } from '@/lib/auth/server-auth';

/**
 * GET /api/admin/analytics/destinations
 * Get destination analytics for admin dashboard
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'Admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d';

    const daysAgo = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysAgo);

    // Most viewed destinations
    const mostViewed = await DestinationView.aggregate([
      { $match: { viewedAt: { $gte: cutoffDate } } },
      {
        $group: {
          _id: '$destinationId',
          viewCount: { $sum: 1 },
        },
      },
      { $sort: { viewCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'destinations',
          localField: '_id',
          foreignField: '_id',
          as: 'destination',
        },
      },
      { $unwind: '$destination' },
      {
        $project: {
          destinationId: '$_id',
          viewCount: 1,
          name: '$destination.name',
          province: '$destination.province',
          type: '$destination.type',
        },
      },
    ]);

    // Destinations by region
    const byRegion = await Destination.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$region',
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' },
          totalViews: { $sum: '$views' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Destinations by type
    const byType = await Destination.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' },
          totalViews: { $sum: '$views' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Click-through rate by destination
    const destinationsWithCTR = await Destination.find({
      isActive: true,
      views: { $gt: 0 },
    })
      .select('name province views clicks')
      .sort({ views: -1 })
      .limit(10)
      .lean();

    const topCTR = destinationsWithCTR
      .map((dest: any) => ({
        ...dest,
        ctr: ((dest.clicks / dest.views) * 100).toFixed(2),
      }))
      .sort((a: any, b: any) => parseFloat(b.ctr) - parseFloat(a.ctr));

    // View trends
    const viewTrends = await DestinationView.aggregate([
      { $match: { viewedAt: { $gte: cutoffDate } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$viewedAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Total stats
    const totalDestinations = await Destination.countDocuments({ isActive: true });
    const totalViews = await DestinationView.countDocuments({
      viewedAt: { $gte: cutoffDate },
    });

    return NextResponse.json({
      success: true,
      data: {
        period,
        summary: {
          totalDestinations,
          totalViews,
        },
        mostViewed,
        byRegion,
        byType,
        topCTR,
        viewTrends,
      },
    });
  } catch (error: any) {
    console.error('❌ Get destination analytics error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

