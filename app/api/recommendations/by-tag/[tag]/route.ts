import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { Destination } from '@/lib/models';
import { getPopularByTag } from '@/lib/utils/recommendations';

/**
 * GET /api/recommendations/by-tag/[tag]
 * Get popular destinations by specific tag
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tag: string }> }
) {
  try {
    await connectDB();
    const { tag } = await params;

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '12');

    const destinations = await getPopularByTag(Destination, tag, limit);

    return NextResponse.json({
      success: true,
      data: destinations,
      count: destinations.length,
      tag,
    });
  } catch (error: any) {
    console.error('❌ Get destinations by tag error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

