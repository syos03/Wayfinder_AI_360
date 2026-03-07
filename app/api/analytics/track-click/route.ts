/**
 * Track Destination Click API
 * POST /api/analytics/track-click
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { SearchHistory, Destination } from '@/lib/models';
import { getCurrentUser } from '@/lib/auth/server-auth';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { destinationId, searchQuery, source } = await request.json();
    
    if (!destinationId) {
      return NextResponse.json(
        { success: false, error: 'Destination ID required' },
        { status: 400 }
      );
    }

    // Get current user (if logged in)
    const user = await getCurrentUser();

    // Increment destination clicks counter (async)
    Destination.findByIdAndUpdate(
      destinationId,
      { $inc: { clicks: 1 } }
    ).catch(err => console.error('Failed to update clicks count:', err));

    // Update search history with clicked destination (if from search)
    if (searchQuery && source === 'search') {
      SearchHistory.updateMany(
        {
          userId: user?.id || null,
          query: searchQuery,
          createdAt: { $gte: new Date(Date.now() - 3600000) }, // Last hour
        },
        {
          $addToSet: { clickedDestinations: new mongoose.Types.ObjectId(destinationId) },
        }
      ).catch(err => console.error('Failed to update search history:', err));
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Track click error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

