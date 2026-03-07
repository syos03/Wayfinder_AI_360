/**
 * GET/PATCH/DELETE /api/trip-plans/[id]
 * Manage specific trip plan
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/server-auth';
import { connectDB } from '@/lib/db/mongodb';
import TripPlan from '@/lib/models/TripPlan';
import mongoose from 'mongoose';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid plan ID' }, { status: 400 });
    }

    await connectDB();

    const plan = await TripPlan.findById(id)
      .populate('destinations', 'name images province type')
      .populate('userId', 'name avatar')
      .lean();

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Increment views
    await TripPlan.findByIdAndUpdate(id, { $inc: { views: 1 } });

    return NextResponse.json({
      success: true,
      data: { plan },
    });
  } catch (error: any) {
    console.error('Get trip plan error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trip plan' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid plan ID' }, { status: 400 });
    }

    await connectDB();

    const plan = await TripPlan.findById(id);
    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Check ownership
    if (plan.userId.toString() !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update fields
    const allowedFields = ['title', 'isPublic', 'itinerary', 'tips', 'warnings'];
    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        (plan as any)[field] = body[field];
      }
    });

    await plan.save();

    return NextResponse.json({
      success: true,
      data: { plan },
    });
  } catch (error: any) {
    console.error('Update trip plan error:', error);
    return NextResponse.json(
      { error: 'Failed to update trip plan' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid plan ID' }, { status: 400 });
    }

    await connectDB();

    const plan = await TripPlan.findById(id);
    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Check ownership
    if (plan.userId.toString() !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await TripPlan.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Trip plan deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete trip plan error:', error);
    return NextResponse.json(
      { error: 'Failed to delete trip plan' },
      { status: 500 }
    );
  }
}

