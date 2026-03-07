/**
 * GET /api/auth/me
 * Get current user - MongoDB version
 */

import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { connectDB } from '@/lib/db/mongodb'
import User from '@/lib/models/User'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function GET(req: NextRequest) {
  try {
    // Get token from cookie
    const token = req.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy token xác thực' },
        { status: 401 }
      )
    }

    // Verify token
    let decoded: any
    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Token không hợp lệ hoặc đã hết hạn' },
        { status: 401 }
      )
    }

    // Connect to MongoDB
    await connectDB()

    // Get user from database
    const user = await User.findById(decoded.userId).select('-passwordHash')

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy người dùng' },
        { status: 404 }
      )
    }

    // Check if account is active
    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: 'Tài khoản đã bị vô hiệu hóa' },
        { status: 403 }
      )
    }

    // Check if account is banned
    if (user.isBanned) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Tài khoản đã bị cấm${user.banReason ? ': ' + user.banReason : ''}` 
        },
        { status: 403 }
      )
    }

    // Update last active
    user.lastActive = new Date()
    await user.save()

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          bio: user.bio,
          role: user.role,
          permissions: user.permissions,
          isActive: user.isActive,
          preferences: user.preferences,
          createdAt: user.createdAt,
        },
      },
    })

  } catch (error: any) {
    console.error('Get current user error:', error)
    return NextResponse.json(
      { success: false, error: 'Lỗi server' },
      { status: 500 }
    )
  }
}
