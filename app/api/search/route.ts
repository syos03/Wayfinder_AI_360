/**
 * Advanced Search API
 * GET /api/search - Multi-criteria destination search
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { Destination, SearchHistory } from '@/lib/models';
import { getCurrentUser } from '@/lib/auth/server-auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    
    // Get search parameters
    const query = searchParams.get('q') || '';
    const region = searchParams.get('region') || '';
    const type = searchParams.get('type') || '';
    const minBudget = parseInt(searchParams.get('minBudget') || '0');
    const maxBudget = parseInt(searchParams.get('maxBudget') || '999999999');
    const minRating = parseFloat(searchParams.get('minRating') || '0');
    const duration = searchParams.get('duration') || '';
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || [];
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const sort = searchParams.get('sort') || 'popularity'; // popularity, rating, newest, name

    // Build search filter
    const filter: any = { isActive: true };

    // Text search
    if (query) {
      filter.$text = { $search: query };
    }

    // Region filter
    if (region) {
      filter.region = region;
    }

    // Type filter
    if (type) {
      filter.type = type;
    }

    // Budget filter
    if (minBudget > 0 || maxBudget < 999999999) {
      filter['budget.medium'] = {
        $gte: minBudget,
        $lte: maxBudget,
      };
    }

    // Rating filter
    if (minRating > 0) {
      filter.rating = { $gte: minRating };
    }

    // Duration filter
    if (duration) {
      filter.duration = duration;
    }

    // Tags filter
    if (tags.length > 0) {
      filter.tags = { $in: tags };
    }

    // Build sort
    let sortQuery: any = {};
    switch (sort) {
      case 'popularity':
        sortQuery = { trendingScore: -1, views: -1, rating: -1 };
        break;
      case 'rating':
        sortQuery = { rating: -1, reviewCount: -1 };
        break;
      case 'newest':
        sortQuery = { createdAt: -1 };
        break;
      case 'name':
        sortQuery = { name: 1 };
        break;
      case 'price-low':
        sortQuery = { 'budget.medium': 1 };
        break;
      case 'price-high':
        sortQuery = { 'budget.medium': -1 };
        break;
      default:
        sortQuery = { trendingScore: -1, rating: -1 };
    }

    // Get current user (if logged in)
    const user = await getCurrentUser();

    // Execute search
    const skip = (page - 1) * limit;
    const [destinations, total] = await Promise.all([
      Destination.find(filter)
        .select('-__v')
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .lean(),
      Destination.countDocuments(filter),
    ]);

    // Log search history (async, don't wait) - only if there's a query
    if (query && query.trim()) {
      // Build filters object without undefined values
      const filters: any = {};
      if (region) filters.region = region;
      if (type) filters.type = type;
      if (minBudget > 0 || maxBudget < 999999999) {
        filters.budget = { min: minBudget, max: maxBudget };
      }
      if (minRating > 0) filters.rating = minRating;
      if (duration) filters.duration = duration;

      SearchHistory.create({
        userId: user?.id || null,
        query: query.trim(),
        filters: Object.keys(filters).length > 0 ? filters : undefined,
        resultsCount: total,
        source: 'web',
      }).catch(err => console.error('Failed to log search:', err));
    }

    return NextResponse.json({
      success: true,
      data: {
        destinations,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
        filters: {
          query,
          region,
          type,
          minBudget,
          maxBudget,
          minRating,
          duration,
          tags,
          sort,
        },
      },
    });

  } catch (error: any) {
    console.error('Search API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

