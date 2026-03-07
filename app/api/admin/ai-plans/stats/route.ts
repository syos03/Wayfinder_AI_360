/**
 * Admin API: AI Plans Statistics
 * GET /api/admin/ai-plans/stats - Get detailed statistics
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

    // Basic counts
    const totalPlans = await TripPlan.countDocuments();
    const plansToday = await TripPlan.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    });
    const plansLast7Days = await TripPlan.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    });
    const plansLast30Days = await TripPlan.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    });

    // Unique users who created plans
    const uniqueUsers = await TripPlan.distinct('userId');

    // Average metrics
    const avgMetrics = await TripPlan.aggregate([
      {
        $group: {
          _id: null,
          avgDays: { $avg: '$days' },
          avgBudget: { $avg: '$budget' },
          avgTravelers: { $avg: '$travelers' },
          totalViews: { $sum: '$views' },
        },
      },
    ]);

    // Travel styles distribution
    const travelStyles = await TripPlan.aggregate([
      {
        $group: {
          _id: '$travelStyle',
          count: { $sum: 1 },
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

    // Budget ranges
    const budgetRanges = await TripPlan.aggregate([
      {
        $bucket: {
          groupBy: '$budget',
          boundaries: [0, 3000000, 5000000, 10000000, 20000000, Infinity],
          default: 'other',
          output: {
            count: { $sum: 1 },
          },
        },
      },
    ]);

    // Top destinations in AI plans
    const topDestinations = await TripPlan.aggregate([
      { $unwind: '$destinations' },
      {
        $group: {
          _id: '$destinations',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
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
          _id: 1,
          count: 1,
          name: '$destination.name',
          province: '$destination.province',
          images: '$destination.images',
        },
      },
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

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalPlans,
          plansToday,
          plansLast7Days,
          plansLast30Days,
          uniqueUsers: uniqueUsers.length,
        },
        averages: avgMetrics[0] || {
          avgDays: 0,
          avgBudget: 0,
          avgTravelers: 0,
          totalViews: 0,
        },
        distributions: {
          travelStyles,
          daysDistribution,
          budgetRanges,
        },
        topDestinations,
        popularInterests,
      },
    });
  } catch (error: any) {
    console.error('Admin AI plans stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}

