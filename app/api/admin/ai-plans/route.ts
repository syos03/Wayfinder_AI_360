/**
 * Admin API: AI Trip Plans Management
 * GET /api/admin/ai-plans - List all AI plans with filters
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/server-auth';
import { connectDB } from '@/lib/db/mongodb';
import TripPlan from '@/lib/models/TripPlan';
import User from '@/lib/models/User';

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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const userId = searchParams.get('userId') || '';
    const days = searchParams.get('days') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';

    // Build query
    const query: any = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { origin: { $regex: search, $options: 'i' } },
      ];
    }

    if (userId) {
      query.userId = userId;
    }

    if (days) {
      query.days = parseInt(days);
    }

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Get total count
    const total = await TripPlan.countDocuments(query);

    // Get plans
    const plans = await TripPlan.find(query)
      .populate('userId', 'name email avatar')
      .populate('destinations', 'name province images')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Calculate stats
    const stats = {
      total: await TripPlan.countDocuments(),
      today: await TripPlan.countDocuments({
        createdAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      }),
      last7Days: await TripPlan.countDocuments({
        createdAt: {
          $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      }),
      last30Days: await TripPlan.countDocuments({
        createdAt: {
          $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      }),
    };

    return NextResponse.json({
      success: true,
      data: {
        plans,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
        stats,
      },
    });
  } catch (error: any) {
    console.error('Admin get AI plans error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AI plans' },
      { status: 500 }
    );
  }
}

