/**
 * Search Autocomplete API
 * GET /api/search/autocomplete?q=query
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { Destination, SearchHistory } from '@/lib/models';
import { getCurrentUser } from '@/lib/auth/server-auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    
    if (!query || query.length < 2) {
      return NextResponse.json({
        success: true,
        data: {
          suggestions: [],
          destinations: [],
        },
      });
    }

    const user = await getCurrentUser();

    // Search for matching destinations
    const destinations = await Destination.find({
      isActive: true,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { province: { $regex: query, $options: 'i' } },
        { nameEn: { $regex: query, $options: 'i' } },
      ],
    })
      .select('name province type images region')
      .limit(5)
      .lean();

    // Get popular search suggestions based on history
    const popularSearches = await SearchHistory.aggregate([
      {
        $match: {
          query: { $regex: query, $options: 'i' },
          resultsCount: { $gt: 0 },
        },
      },
      {
        $group: {
          _id: '$query',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 3,
      },
    ]);

    const suggestions = popularSearches.map(item => item._id);

    // Get user's recent searches if logged in
    let recentSearches: string[] = [];
    if (user) {
      const recent = await SearchHistory.find({
        userId: user.id,
        query: { $regex: query, $options: 'i' },
      })
        .select('query')
        .sort({ createdAt: -1 })
        .limit(3)
        .lean();

      recentSearches = recent.map(item => item.query);
    }

    return NextResponse.json({
      success: true,
      data: {
        suggestions: Array.from(new Set([...recentSearches, ...suggestions])).slice(0, 5),
        destinations,
      },
    });

  } catch (error: any) {
    console.error('Autocomplete API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

