/**
 * Popular Searches API
 * GET /api/search/popular
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { SearchHistory } from '@/lib/models';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const period = searchParams.get('period') || '7d'; // 7d, 30d, all

    // Calculate date range
    let dateFilter: any = {};
    if (period !== 'all') {
      const days = period === '7d' ? 7 : 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      dateFilter = { createdAt: { $gte: startDate } };
    }

    // Get popular searches
    const popularSearches = await SearchHistory.aggregate([
      {
        $match: {
          ...dateFilter,
          resultsCount: { $gt: 0 }, // Only include searches with results
        },
      },
      {
        $group: {
          _id: '$query',
          count: { $sum: 1 },
          avgResults: { $avg: '$resultsCount' },
          lastSearched: { $max: '$createdAt' },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: limit,
      },
      {
        $project: {
          query: '$_id',
          searchCount: '$count',
          avgResults: { $round: ['$avgResults', 0] },
          lastSearched: 1,
          _id: 0,
        },
      },
    ]);

    return NextResponse.json({
      success: true,
      data: {
        popular: popularSearches,
        period,
      },
    });

  } catch (error: any) {
    console.error('Popular searches API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

