/**
 * Email Preferences API
 * Get and update user email preferences
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import EmailPreferences from '@/lib/models/EmailPreferences';
import User from '@/lib/models/User';
import { getCurrentUser as getUser } from '@/lib/auth/server-auth';

/**
 * GET /api/email/preferences
 * Get current user's email preferences
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    let preferences = await EmailPreferences.findOne({ userId: user.id });

    // Create default preferences if not exists
    if (!preferences) {
      preferences = await EmailPreferences.create({
        userId: user.id,
        transactional: true,
        notifications: {
          reviews: true,
          followers: true,
          badges: true,
          replies: true,
        },
        marketing: true,
        frequency: 'instant',
      });
    }

    return NextResponse.json({
      success: true,
      data: preferences,
    });
  } catch (error: any) {
    console.error('Get preferences error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/email/preferences
 * Update email preferences
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    await connectDB();

    let preferences = await EmailPreferences.findOne({ userId: user.id });

    if (!preferences) {
      // Create new preferences
      preferences = await EmailPreferences.create({
        userId: user.id,
        ...body,
      });
    } else {
      // Update existing preferences
      Object.assign(preferences, body);
      await preferences.save();
    }

    return NextResponse.json({
      success: true,
      message: 'Preferences updated successfully',
      data: preferences,
    });
  } catch (error: any) {
    console.error('Update preferences error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

