/**
 * Admin Email Management API
 * View email logs and statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import EmailLog from '@/lib/models/EmailLog';
import { checkAdmin } from '@/lib/middleware/admin';

/**
 * GET /api/admin/emails
 * Get email logs with filters
 */
export async function GET(request: NextRequest) {
  try {
    const adminCheck = await checkAdmin(request);
    if (!adminCheck.authorized) {
      return NextResponse.json(
        { success: false, error: adminCheck.error },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const template = searchParams.get('template');

    await connectDB();

    // Build query
    const query: any = {};
    if (type) query.type = type;
    if (status) query.status = status;
    if (template) query.template = template;

    // Get total count
    const total = await EmailLog.countDocuments(query);

    // Get emails
    const emails = await EmailLog.find(query)
      .sort({ sentAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('userId', 'name email')
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        emails,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: any) {
    console.error('Get emails error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

