import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { Destination, UserPreferences, Review } from '@/lib/models';
import { getCurrentUser } from '@/lib/auth/server-auth';
import {
  getPersonalizedRecommendations,
  getCollaborativeRecommendations,
} from '@/lib/utils/recommendations';
import mongoose from 'mongoose';

/**
 * GET /api/recommendations/for-you
 * Get personalized recommendations for the current user
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '12');
    const method = searchParams.get('method') || 'all'; // 'personalized', 'collaborative', 'all'

    const userId = new mongoose.Types.ObjectId(currentUser.id);

    let personalizedResults: any[] = [];
    let collaborativeResults: any[] = [];

    // Get personalized recommendations (based on preferences)
    if (method === 'personalized' || method === 'all') {
      personalizedResults = await getPersonalizedRecommendations(
        Destination,
        UserPreferences,
        Review,
        userId,
        limit
      );
    }

    // Get collaborative recommendations (based on similar users)
    if (method === 'collaborative' || method === 'all') {
      collaborativeResults = await getCollaborativeRecommendations(
        Destination,
        Review,
        userId,
        limit
      );
    }

    // Merge results (remove duplicates)
    let finalResults = [];
    if (method === 'all') {
      const seen = new Set();
      const merged = [
        ...collaborativeResults.map((d: any) => ({ ...d, source: 'collaborative' })),
        ...personalizedResults.map((d: any) => ({ ...d, source: 'personalized' })),
      ];

      for (const dest of merged) {
        // Check if dest and dest._id exist
        if (dest && dest._id) {
          const id = dest._id.toString();
          if (!seen.has(id)) {
            seen.add(id);
            finalResults.push(dest);
          }
        }
      }

      finalResults = finalResults.slice(0, limit);
    } else {
      finalResults = method === 'personalized' ? personalizedResults : collaborativeResults;
    }

    return NextResponse.json({
      success: true,
      data: finalResults,
      count: finalResults.length,
      method,
    });
  } catch (error: any) {
    console.error('❌ Get personalized recommendations error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

