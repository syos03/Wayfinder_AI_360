import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { User, Review, Destination } from '@/lib/models';
import { checkAdmin } from '@/lib/middleware/admin';

/**
 * GET /api/analytics/user-growth
 * Get user growth trend data for charts
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

    // Aggregate user growth by day
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
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

    // Aggregate review growth by day
    const reviewGrowth = await Review.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: 'approved',
        },
      },
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

    // Aggregate destination creation by day
    const destinationGrowth = await Destination.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
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

    // Fill in missing dates with 0
    const fillDates = (data: any[]) => {
      const filled = [];
      const dataMap = new Map(data.map((d) => [d._id, d.count]));

      for (let i = daysBack; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        filled.push({
          date: dateStr,
          count: dataMap.get(dateStr) || 0,
        });
      }

      return filled;
    };

    return NextResponse.json({
      success: true,
      data: {
        period: period,
        users: fillDates(userGrowth),
        reviews: fillDates(reviewGrowth),
        destinations: fillDates(destinationGrowth),
      },
    });
  } catch (error: any) {
    console.error('❌ Get user growth error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

