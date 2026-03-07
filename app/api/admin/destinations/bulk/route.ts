/**
 * Admin Destination Bulk Operations API
 * POST /api/admin/destinations/bulk - Bulk activate/deactivate/delete
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { Destination } from '@/lib/models';
import { requireAdmin } from '@/lib/middleware/admin';

/**
 * POST /api/admin/destinations/bulk
 * Bulk operations: activate, deactivate, delete
 */
export async function POST(req: NextRequest) {
  const { user, error } = await requireAdmin(req);
  if (error) return error;

  try {
    await connectDB();

    const body = await req.json();
    const { action, ids } = body;

    // Validation
    if (!action || !ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Action và IDs là bắt buộc' },
        { status: 400 }
      );
    }

    const validActions = ['activate', 'deactivate', 'delete'];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Action không hợp lệ' },
        { status: 400 }
      );
    }

    let result;
    let message = '';

    switch (action) {
      case 'activate':
        result = await Destination.updateMany(
          { _id: { $in: ids } },
          { $set: { isActive: true } }
        );
        message = `Đã kích hoạt ${result.modifiedCount} điểm đến`;
        break;

      case 'deactivate':
        result = await Destination.updateMany(
          { _id: { $in: ids } },
          { $set: { isActive: false } }
        );
        message = `Đã vô hiệu hóa ${result.modifiedCount} điểm đến`;
        break;

      case 'delete':
        // Hard delete: permanently remove from database
        // Import related models
        const { Review, DestinationView, User, SearchHistory } = await import('@/lib/models');
        const TripPlan = (await import('@/lib/models/TripPlan')).default;
        
        // Delete related data in parallel for all destinations
        await Promise.all([
          // Delete all reviews
          Review.deleteMany({ destinationId: { $in: ids } }),
          
          // Delete all views
          DestinationView.deleteMany({ destinationId: { $in: ids } }),
          
          // Remove from user favorites
          User.updateMany(
            { favorites: { $in: ids } },
            { $pull: { favorites: { $in: ids } } }
          ),
          
          // Remove from trip plans
          TripPlan.updateMany(
            { destinations: { $in: ids } },
            { $pull: { destinations: { $in: ids } } }
          ),
          
          // Remove from search history
          SearchHistory.updateMany(
            { clickedDestinations: { $in: ids } },
            { $pull: { clickedDestinations: { $in: ids } } }
          ),
        ]);
        
        // Hard delete destinations
        result = await Destination.deleteMany({ _id: { $in: ids } });
        message = `Đã xóa ${result.deletedCount} điểm đến và dữ liệu liên quan`;
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Action không hợp lệ' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: {
        modified: 'modifiedCount' in result ? result.modifiedCount : undefined,
        matched: 'matchedCount' in result ? result.matchedCount : undefined,
        deleted: 'deletedCount' in result ? result.deletedCount : undefined,
      },
      message,
    });

  } catch (error: any) {
    console.error('Admin bulk destinations error:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi server' },
      { status: 500 }
    );
  }
}

