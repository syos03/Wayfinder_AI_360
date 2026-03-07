/**
 * Reviews API - Public
 * GET: List reviews for a destination
 * POST: Create a new review (requires auth)
 */

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongodb'
import Review from '@/lib/models/Review'
import Destination from '@/lib/models/Destination'
import { getCurrentUser } from '@/lib/auth/server-auth'
import mongoose from 'mongoose'

// GET /api/reviews?destinationId={id}&page=1&limit=10&sort=newest
export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const destinationId = searchParams.get('destinationId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const sort = searchParams.get('sort') || 'newest' // newest, oldest, highest, lowest, helpful

    if (!destinationId) {
      return NextResponse.json(
        { success: false, error: 'destinationId is required' },
        { status: 400 }
      )
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(destinationId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid destinationId' },
        { status: 400 }
      )
    }

    // Build query
    const query: any = {
      destinationId: new mongoose.Types.ObjectId(destinationId),
      isApproved: true,
      isRejected: false,
    }

    // Build sort
    let sortQuery: any = { createdAt: -1 } // newest by default
    switch (sort) {
      case 'oldest':
        sortQuery = { createdAt: 1 }
        break
      case 'highest':
        sortQuery = { rating: -1, createdAt: -1 }
        break
      case 'lowest':
        sortQuery = { rating: 1, createdAt: -1 }
        break
      case 'helpful':
        sortQuery = { helpful: -1, createdAt: -1 }
        break
    }

    // Pagination
    const skip = (page - 1) * limit

    // Fetch reviews
    const [reviews, total] = await Promise.all([
      Review.find(query)
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments(query),
    ])

    // Calculate stats
    const stats = await Review.aggregate([
      { 
        $match: { 
          destinationId: new mongoose.Types.ObjectId(destinationId), 
          isApproved: true, 
          isRejected: false 
        } 
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          rating5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
          rating4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          rating3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          rating2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          rating1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
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
          avgRating: 0,
          totalReviews: 0,
          rating5: 0,
          rating4: 0,
          rating3: 0,
          rating2: 0,
          rating1: 0,
        },
      },
    })
  } catch (error: any) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

// POST /api/reviews
export async function POST(req: NextRequest) {
  try {
    await connectDB()

    // Check authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng đăng nhập để viết đánh giá' },
        { status: 401 }
      )
    }

    console.log('👤 User creating review:', user)

    const body = await req.json()
    const { destinationId, rating, title, content, photos } = body

    console.log('📝 Review data:', { destinationId, rating, title, content, photos })

    // Validate
    if (!destinationId || !rating || !title || !content) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng điền đầy đủ thông tin' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Đánh giá phải từ 1-5 sao' },
        { status: 400 }
      )
    }

    // Check if destination exists
    const destination = await Destination.findById(destinationId)
    if (!destination) {
      return NextResponse.json(
        { success: false, error: 'Điểm đến không tồn tại' },
        { status: 404 }
      )
    }

    // Check if user already reviewed this destination
    const existingReview = await Review.findOne({
      destinationId: new mongoose.Types.ObjectId(destinationId),
      userId: new mongoose.Types.ObjectId(user.id),
    })

    if (existingReview) {
      return NextResponse.json(
        { success: false, error: 'Bạn đã đánh giá điểm đến này rồi' },
        { status: 400 }
      )
    }

    // Create review
    const reviewData = {
      destinationId: new mongoose.Types.ObjectId(destinationId),
      userId: new mongoose.Types.ObjectId(user.id),
      userName: user.name,
      userAvatar: user.avatar || '',
      rating,
      title: title.trim(),
      content: content.trim(),
      photos: photos || [],
      isApproved: false, // Requires moderation
    }

    console.log('💾 Creating review with data:', reviewData)

    const review = await Review.create(reviewData)

    return NextResponse.json({
      success: true,
      data: { review },
      message: 'Đánh giá của bạn đang chờ duyệt',
    })
  } catch (error: any) {
    console.error('💥 Error creating review:', error)
    console.error('💥 Error message:', error.message)
    console.error('💥 Error stack:', error.stack)
    
    // Handle duplicate review error
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Bạn đã đánh giá điểm đến này rồi' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Không thể tạo đánh giá' },
      { status: 500 }
    )
  }
}
