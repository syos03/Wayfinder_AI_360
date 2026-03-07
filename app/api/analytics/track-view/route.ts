/**
 * Track Destination View API
 * POST /api/analytics/track-view
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { DestinationView, Destination } from '@/lib/models';
import { getCurrentUser } from '@/lib/auth/server-auth';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { destinationId, source } = await request.json();
    
    if (!destinationId) {
      return NextResponse.json(
        { success: false, error: 'Destination ID required' },
        { status: 400 }
      );
    }

    // Get current user (if logged in)
    const user = await getCurrentUser();

    // Get session ID from cookie or create new one
    let sessionId = request.cookies.get('sessionId')?.value;
    if (!sessionId) {
      sessionId = `anon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Create view record
    await DestinationView.create({
      destinationId,
      userId: user?.id || null,
      source: source || 'direct',
      sessionId: user ? null : sessionId,
      viewedAt: new Date(),
    });

    // Increment destination views counter (async, don't wait)
    Destination.findByIdAndUpdate(
      destinationId,
      { $inc: { views: 1 } }
    ).catch(err => console.error('Failed to update views count:', err));

    const response = NextResponse.json({ success: true });
    
    // Set session ID cookie if new
    if (!request.cookies.get('sessionId')) {
      response.cookies.set('sessionId', sessionId, {
        maxAge: 60 * 60 * 24 * 365, // 1 year
        httpOnly: true,
        sameSite: 'lax',
      });
    }

    return response;

  } catch (error: any) {
    console.error('Track view error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

