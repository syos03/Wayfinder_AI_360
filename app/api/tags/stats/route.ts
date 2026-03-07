import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { Destination } from '@/lib/models';

/**
 * GET /api/tags/stats
 * Get tag statistics (count of destinations per tag)
 */
export async function GET() {
  try {
    await connectDB();

    // Aggregate tags from all active destinations
    const tagStats = await Destination.aggregate([
      { $match: { isActive: true } },
      { $unwind: '$tags' },
      {
        $group: {
          _id: '$tags',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Format response
    const stats = tagStats.map((stat) => ({
      tag: stat._id,
      count: stat.count,
    }));

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error('❌ Get tag stats error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

