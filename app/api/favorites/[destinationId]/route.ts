/**
 * POST /api/favorites/[destinationId]
 * Toggle favorite status for a destination
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/server-auth';
import { connectDB } from '@/lib/db/mongodb';
import User from '@/lib/models/User';
import Destination from '@/lib/models/Destination';
import mongoose from 'mongoose';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ destinationId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { destinationId } = await params;

    // Validate destination ID
    if (!mongoose.Types.ObjectId.isValid(destinationId)) {
      return NextResponse.json({ error: 'Invalid destination ID' }, { status: 400 });
    }

    await connectDB();

    // Check if destination exists
    const destination = await Destination.findById(destinationId);
    if (!destination) {
      return NextResponse.json({ error: 'Destination not found' }, { status: 404 });
    }

    // Get user data
    const userData = await User.findById(user.id);
    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Initialize favorites array if not exists
    if (!userData.favorites) {
      userData.favorites = [];
    }

    // Toggle favorite
    const isFavorited = userData.favorites.some(
      (fav: any) => fav.toString() === destinationId
    );

    if (isFavorited) {
      // Remove from favorites
      userData.favorites = userData.favorites.filter(
        (fav: any) => fav.toString() !== destinationId
      );
    } else {
      // Add to favorites
      userData.favorites.push(new mongoose.Types.ObjectId(destinationId));
    }

    await userData.save();

    return NextResponse.json({
      success: true,
      data: {
        isFavorited: !isFavorited,
        favoritesCount: userData.favorites.length,
      },
    });
  } catch (error: any) {
    console.error('Toggle favorite error:', error);
    return NextResponse.json(
      { error: 'Failed to toggle favorite' },
      { status: 500 }
    );
  }
}

