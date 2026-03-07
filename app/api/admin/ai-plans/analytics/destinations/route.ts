/**
 * Admin API: AI Plans Destinations Analytics
 * GET /api/admin/ai-plans/analytics/destinations - Popular destinations in AI plans
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

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // Top destinations in AI plans
    const topDestinations = await TripPlan.aggregate([
      { $unwind: '$destinations' },
      {
        $group: {
          _id: '$destinations',
          count: { $sum: 1 },
          avgBudget: { $avg: '$budget' },
          avgDays: { $avg: '$days' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: limit },
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
          avgBudget: 1,
          avgDays: 1,
          name: '$destination.name',
          province: '$destination.province',
          region: '$destination.region',
          type: '$destination.type',
          images: '$destination.images',
        },
      },
    ]);

    // Destinations by region
    const destinationsByRegion = await TripPlan.aggregate([
      { $unwind: '$destinations' },
      {
        $lookup: {
          from: 'destinations',
          localField: 'destinations',
          foreignField: '_id',
          as: 'destination',
        },
      },
      { $unwind: '$destination' },
      {
        $group: {
          _id: '$destination.region',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Destinations by type
    const destinationsByType = await TripPlan.aggregate([
      { $unwind: '$destinations' },
      {
        $lookup: {
          from: 'destinations',
          localField: 'destinations',
          foreignField: '_id',
          as: 'destination',
        },
      },
      { $unwind: '$destination' },
      {
        $group: {
          _id: '$destination.type',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return NextResponse.json({
      success: true,
      data: {
        topDestinations,
        byRegion: destinationsByRegion,
        byType: destinationsByType,
      },
    });
  } catch (error: any) {
    console.error('Admin AI plans destinations analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch destinations analytics' },
      { status: 500 }
    );
  }
}

