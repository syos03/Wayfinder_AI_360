/**
 * GET /api/trip-plans
 * Get user's trip plans
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

    await connectDB();

    const plans = await TripPlan.find({ userId: user.id })
      .populate('destinations', 'name images province')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        plans,
        count: plans.length,
      },
    });
  } catch (error: any) {
    console.error('Get trip plans error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trip plans' },
      { status: 500 }
    );
  }
}

