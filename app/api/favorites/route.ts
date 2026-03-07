/**
 * GET /api/favorites
 * Get all favorited destinations for current user
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/server-auth';
import { connectDB } from '@/lib/db/mongodb';
import User from '@/lib/models/User';
import Destination from '@/lib/models/Destination';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const userData = await User.findById(user.id)
      .populate({
        path: 'favorites',
        model: Destination,
        match: { isActive: true }, // Only return active destinations
      })
      .lean();

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const favorites = userData.favorites || [];

    return NextResponse.json({
      success: true,
      data: {
        favorites,
        count: favorites.length,
      },
    });
  } catch (error: any) {
    console.error('Get favorites error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 }
    );
  }
}

