/**
 * Public Destination Detail API
 * GET /api/destinations/[id] - Get single destination by ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { Destination } from '@/lib/models';

/**
 * GET /api/destinations/[id]
 * Public endpoint - No authentication required
 * Only returns active destination
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    // Get destination by ID (only if active)
    const destination = await Destination.findOne({ 
      _id: id,
      isActive: true 
    }).select('-__v');

    if (!destination) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy điểm đến' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { destination },
    });

  } catch (error: any) {
    console.error('Public get destination by ID error:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi server' },
      { status: 500 }
    );
  }
}

