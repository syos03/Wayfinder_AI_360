/**
 * Public Destinations API
 * GET /api/destinations - List active destinations for public users
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { Destination } from '@/lib/models';

/**
 * GET /api/destinations
 * Public endpoint - No authentication required
 * Only returns active destinations
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const region = searchParams.get('region') || '';
    const type = searchParams.get('type') || '';

    // Build query - only active destinations
    const query: any = { isActive: true };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { nameEn: { $regex: search, $options: 'i' } },
        { province: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (region) query.region = region;
    if (type) query.type = type;

    // Count total
    const total = await Destination.countDocuments(query);

    // Get destinations
    const destinations = await Destination.find(query)
      .sort({ rating: -1, reviewCount: -1, createdAt: -1 }) // Sort by rating first
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-__v'); // Exclude version field

    return NextResponse.json({
      success: true,
      data: {
        destinations,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });

  } catch (error: any) {
    console.error('Public get destinations error:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi server' },
      { status: 500 }
    );
  }
}
