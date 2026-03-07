/**
 * Admin API: AI Plans Trends Analytics
 * GET /api/admin/ai-plans/analytics/trends - Travel trends and patterns
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/server-auth';
import { connectDB } from '@/lib/db/mongodb';
import TripPlan from '@/lib/models/TripPlan';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin permission
    if (!['admin', 'super_admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    // Budget trends
    const budgetTrends = await TripPlan.aggregate([
      {
        $bucket: {
          groupBy: '$budget',
          boundaries: [0, 3000000, 5000000, 10000000, 20000000, Infinity],
          default: 'other',
          output: {
            count: { $sum: 1 },
            label: { $first: '$budget' },
          },
        },
      },
    ]);

    // Add readable labels
    const budgetLabels = [
      '< 3tr',
      '3-5tr',
      '5-10tr',
      '10-20tr',
      '> 20tr',
      'Khác',
    ];
    const budgetData = budgetTrends.map((item, index) => ({
      ...item,
      label: budgetLabels[index] || 'Khác',
    }));

    // Travel styles distribution
    const travelStyles = await TripPlan.aggregate([
      {
        $group: {
          _id: '$travelStyle',
          count: { $sum: 1 },
          avgBudget: { $avg: '$budget' },
          avgDays: { $avg: '$days' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Days distribution
    const daysDistribution = await TripPlan.aggregate([
      {
        $group: {
          _id: '$days',
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Popular interests
    const popularInterests = await TripPlan.aggregate([
      { $unwind: '$interests' },
      {
        $group: {
          _id: '$interests',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Travelers distribution
    const travelersDistribution = await TripPlan.aggregate([
      {
        $group: {
          _id: '$travelers',
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Month-over-month growth
    const last60Days = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    const monthlyGrowth = await TripPlan.aggregate([
      {
        $match: {
          createdAt: { $gte: last60Days },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    // Calculate growth rate
    let growthRate = 0;
    if (monthlyGrowth.length >= 2) {
      const current = monthlyGrowth[monthlyGrowth.length - 1].count;
      const previous = monthlyGrowth[monthlyGrowth.length - 2].count;
      growthRate = previous > 0 ? ((current - previous) / previous) * 100 : 0;
    }

    return NextResponse.json({
      success: true,
      data: {
        budgetTrends: budgetData,
        travelStyles,
        daysDistribution,
        popularInterests,
        travelersDistribution,
        monthlyGrowth,
        growthRate: Math.round(growthRate * 10) / 10, // Round to 1 decimal
      },
    });
  } catch (error: any) {
    console.error('Admin AI plans trends analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trends analytics' },
      { status: 500 }
    );
  }
}

