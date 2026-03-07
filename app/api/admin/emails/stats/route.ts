/**
 * Admin Email Statistics API
 * Get email sending statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import EmailLog from '@/lib/models/EmailLog';
import { checkAdmin } from '@/lib/middleware/admin';

export async function GET(request: NextRequest) {
  try {
    const adminCheck = await checkAdmin(request);
    if (!adminCheck.authorized) {
      return NextResponse.json(
        { success: false, error: adminCheck.error },
        { status: 401 }
      );
    }

    await connectDB();

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get statistics
    const [
      totalEmails,
      todayEmails,
      last7DaysEmails,
      last30DaysEmails,
      byType,
      byStatus,
      byTemplate,
    ] = await Promise.all([
      EmailLog.countDocuments(),
      EmailLog.countDocuments({ sentAt: { $gte: today } }),
      EmailLog.countDocuments({ sentAt: { $gte: last7Days } }),
      EmailLog.countDocuments({ sentAt: { $gte: last30Days } }),
      EmailLog.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      EmailLog.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      EmailLog.aggregate([
        { $group: { _id: '$template', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    // Calculate delivery rate
    const sentCount = await EmailLog.countDocuments({ status: 'sent' });
    const deliveredCount = await EmailLog.countDocuments({ status: 'delivered' });
    const failedCount = await EmailLog.countDocuments({ status: 'failed' });
    const deliveryRate = totalEmails > 0 
      ? ((deliveredCount + sentCount) / totalEmails * 100).toFixed(1)
      : '0';

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          total: totalEmails,
          today: todayEmails,
          last7Days: last7DaysEmails,
          last30Days: last30DaysEmails,
          deliveryRate: parseFloat(deliveryRate),
          sent: sentCount,
          delivered: deliveredCount,
          failed: failedCount,
        },
        byType: byType.map((item) => ({
          type: item._id,
          count: item.count,
        })),
        byStatus: byStatus.map((item) => ({
          status: item._id,
          count: item.count,
        })),
        byTemplate: byTemplate.map((item) => ({
          template: item._id,
          count: item.count,
        })),
      },
    });
  } catch (error: any) {
    console.error('Get email stats error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

