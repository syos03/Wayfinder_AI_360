/**
 * GET /api/auth/me
 * Get current user - MongoDB version
 */

import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { connectDB } from '@/lib/db/mongodb'
import User from '@/lib/models/User'

export async function GET(req: NextRequest) {
  try {
    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      console.error('JWT_SECRET is not configured')
      return NextResponse.json(
        { success: false, error: 'Cấu hình xác thực máy chủ chưa hoàn tất' },
        { status: 500 }
      )
    }

    const token = req.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy token xác thực' },
        { status: 401 }
      )
    }

    let decoded: any
    try {
      decoded = jwt.verify(token, jwtSecret)
    } catch {
      return NextResponse.json(
        { success: false, error: 'Token không hợp lệ hoặc đã hết hạn' },
        { status: 401 }
      )
    }

    await connectDB()

    const user = await User.findById(decoded.userId).select('-passwordHash')

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy người dùng' },
        { status: 404 }
      )
    }

    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: 'Tài khoản đã bị vô hiệu hóa' },
        { status: 403 }
      )
    }

    if (user.isBanned) {
      return NextResponse.json(
        {
          success: false,
          error: `Tài khoản đã bị cấm${user.banReason ? ': ' + user.banReason : ''}`,
        },
        { status: 403 }
      )
    }

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
