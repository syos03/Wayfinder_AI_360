/**
 * POST /api/auth/login
 * Login user - MongoDB version
 */

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { connectDB } from '@/lib/db/mongodb'
import User from '@/lib/models/User'

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export async function POST(req: NextRequest) {
  try {
    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      console.error('JWT_SECRET is not configured')
      return NextResponse.json(
        { success: false, error: 'Cấu hình xác thực máy chủ chưa hoàn tất' },
        { status: 500 }
      )
    }

    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email và mật khẩu là bắt buộc' },
        { status: 400 }
      )
    }

    await connectDB()

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Email hoặc mật khẩu không đúng' },
        { status: 401 }
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

    const isValidPassword = await bcrypt.compare(password, user.passwordHash)
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'Email hoặc mật khẩu không đúng' },
        { status: 401 }
      )
    }

    user.lastLogin = new Date()
    user.loginCount = (user.loginCount || 0) + 1
    user.lastActive = new Date()
    await user.save()

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
      },
      jwtSecret,
      { expiresIn: JWT_EXPIRES_IN as string & jwt.SignOptions['expiresIn'] }
    )

    const response = NextResponse.json({
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
          createdAt: user.createdAt,
        },
        token,
      },
      message: 'Đăng nhập thành công',
    })

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    })

    return response
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'Lỗi server, vui lòng thử lại' },
      { status: 500 }
    )
  }
}
