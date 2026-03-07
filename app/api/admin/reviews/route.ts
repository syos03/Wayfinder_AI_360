/**
 * Admin Reviews API
 * GET: List all reviews (pending, approved, rejected)
 */

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongodb'
import Review from '@/lib/models/Review'
import { checkAdmin } from '@/lib/middleware/admin'

// GET /api/admin/reviews?status=pending&page=1&limit=20
export async function GET(req: NextRequest) {
  try {
    // Check admin permissions
    const adminCheck = await checkAdmin(req, ['moderator', 'admin', 'super_admin'])
    if (!adminCheck.authorized) {
      return NextResponse.json(
        { success: false, error: adminCheck.error },
        { status: adminCheck.status }
      )
    }

    await connectDB()

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || 'all' // all, pending, approved, rejected
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''

    // Build query
    const query: any = {}

    switch (status) {
      case 'pending':
        query.isApproved = false
        query.isRejected = false
        break
      case 'approved':
        query.isApproved = true
        break
      case 'rejected':
        query.isRejected = true
        break
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } },
      ]
    }

    // Pagination
    const skip = (page - 1) * limit

    // Fetch reviews with populate
    const [reviews, total] = await Promise.all([
      Review.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('destinationId', 'name province')
        .lean(),
      Review.countDocuments(query),
    ])

    // Get stats
    const stats = await Review.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: {
            $sum: {
              $cond: [{ $and: [{ $eq: ['$isApproved', false] }, { $eq: ['$isRejected', false] }] }, 1, 0],
            },
          },
          approved: { $sum: { $cond: [{ $eq: ['$isApproved', true] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ['$isRejected', true] }, 1, 0] } },
        },
      },
    ])

    return NextResponse.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
        stats: stats.length > 0 ? stats[0] : {
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
        },
      },
    })
  } catch (error: any) {
    console.error('Admin reviews error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}


