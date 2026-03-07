import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { User } from '@/lib/models';
import { checkAdmin } from '@/lib/middleware/admin';

/**
 * GET /api/analytics/retention
 * Get user retention metrics
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

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Calculate date ranges
    const last7Days = new Date(today);
    last7Days.setDate(last7Days.getDate() - 7);
    
    const last14Days = new Date(today);
    last14Days.setDate(last14Days.getDate() - 14);
    
    const last30Days = new Date(today);
    last30Days.setDate(last30Days.getDate() - 30);
    
    const last60Days = new Date(today);
    last60Days.setDate(last60Days.getDate() - 60);

    // Get retention metrics
    const [
      usersJoined7DaysAgo,
      usersActive7DaysAgo,
      usersJoined30DaysAgo,
      usersActive30DaysAgo,
    ] = await Promise.all([
      // Users who joined 7-14 days ago
      User.countDocuments({
        createdAt: { $gte: last14Days, $lt: last7Days },
      }),
      // Of those, how many were active in last 7 days
      User.countDocuments({
        createdAt: { $gte: last14Days, $lt: last7Days },
        lastActive: { $gte: last7Days },
      }),
      // Users who joined 30-60 days ago
      User.countDocuments({
        createdAt: { $gte: last60Days, $lt: last30Days },
      }),
      // Of those, how many were active in last 30 days
      User.countDocuments({
        createdAt: { $gte: last60Days, $lt: last30Days },
        lastActive: { $gte: last30Days },
      }),
    ]);

    // Calculate retention rates
    const retention7Day = usersJoined7DaysAgo > 0
      ? ((usersActive7DaysAgo / usersJoined7DaysAgo) * 100).toFixed(1)
      : '0.0';

    const retention30Day = usersJoined30DaysAgo > 0
      ? ((usersActive30DaysAgo / usersJoined30DaysAgo) * 100).toFixed(1)
      : '0.0';

    // Get cohort analysis (users by week)
    const cohortData = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: last30Days },
        },
      },
      {
        $group: {
          _id: {
            week: { $week: '$createdAt' },
            year: { $year: '$createdAt' },
          },
          users: { $sum: 1 },
          activeUsers: {
            $sum: {
              $cond: [{ $gte: ['$lastActive', last7Days] }, 1, 0],
            },
          },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.week': 1 },
      },
    ]);

    return NextResponse.json({
      success: true,
      data: {
        retention7Day: parseFloat(retention7Day),
        retention30Day: parseFloat(retention30Day),
        cohorts: cohortData.map((item) => ({
          week: `${item._id.year}-W${item._id.week}`,
          users: item.users,
          activeUsers: item.activeUsers,
          retentionRate: item.users > 0 ? ((item.activeUsers / item.users) * 100).toFixed(1) : '0.0',
        })),
      },
    });
  } catch (error: any) {
    console.error('❌ Get retention error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

