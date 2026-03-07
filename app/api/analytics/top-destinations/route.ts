import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { Destination } from '@/lib/models';
import { checkAdmin } from '@/lib/middleware/admin';

/**
 * GET /api/analytics/top-destinations
 * Get top destinations by various metrics
 * Query params: sortBy (views, clicks, reviews, rating), limit (default 10)
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const adminCheck = await checkAdmin(request);
    if (!adminCheck.authorized) {
      return NextResponse.json(
        { success: false, error: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    await connectDB();

    // Get query params
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get('sortBy') || 'views';
    const limit = parseInt(searchParams.get('limit') || '10');

    // Determine sort field
    let sortField = 'views';
    if (sortBy === 'clicks') sortField = 'clicks';
    else if (sortBy === 'reviews') sortField = 'reviewCount';
    else if (sortBy === 'rating') sortField = 'rating';
    else if (sortBy === 'trending') sortField = 'trendingScore';

    // Query top destinations
    const topDestinations = await Destination.find({ isActive: true })
      .sort({ [sortField]: -1 })
      .limit(limit)
      .select('name province region type rating reviewCount views clicks trendingScore images')
      .lean();

    // Format response
    const formatted = topDestinations.map((dest: any, index) => ({
      rank: index + 1,
      id: dest._id.toString(),
      name: dest.name,
      province: dest.province,
      region: dest.region,
      type: dest.type,
      rating: dest.rating || 0,
      reviewCount: dest.reviewCount || 0,
      views: dest.views || 0,
      clicks: dest.clicks || 0,
      trendingScore: dest.trendingScore || 0,
      image: dest.images?.[0] || '',
      metric: sortField === 'views' ? dest.views
              : sortField === 'clicks' ? dest.clicks
              : sortField === 'reviewCount' ? dest.reviewCount
              : sortField === 'rating' ? dest.rating
              : dest.trendingScore,
    }));

    return NextResponse.json({
      success: true,
      data: {
        sortBy: sortBy,
        destinations: formatted,
      },
    });
  } catch (error: any) {
    console.error('❌ Get top destinations error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

