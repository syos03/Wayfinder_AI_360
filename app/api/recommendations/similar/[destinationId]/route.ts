import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { Destination } from '@/lib/models';
import { findSimilarDestinations } from '@/lib/utils/recommendations';
import { recommendationCache, cacheKeys, cacheTTL } from '@/lib/utils/cache';

/**
 * GET /api/recommendations/similar/[destinationId]
 * Get similar destinations based on content similarity (cached)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ destinationId: string }> }
) {
  try {
    await connectDB();
    const { destinationId } = await params;

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '6');

    // Check cache
    const cacheKey = cacheKeys.similar(destinationId, limit);
    const cached = recommendationCache.get(cacheKey);
    if (cached) {
      return NextResponse.json({
        success: true,
        data: cached,
        count: cached.length,
        cached: true,
      });
    }

    // Fetch from database
    const similarDestinations = await findSimilarDestinations(
      Destination,
      destinationId,
      limit
    );

    // Cache result
    recommendationCache.set(cacheKey, similarDestinations, cacheTTL.similar);

    return NextResponse.json({
      success: true,
      data: similarDestinations,
      count: similarDestinations.length,
      cached: false,
    });
  } catch (error: any) {
    console.error('❌ Get similar destinations error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

