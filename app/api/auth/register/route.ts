/**
 * POST /api/auth/register
 * Register new user - MongoDB version
 */

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { connectDB } from '@/lib/db/mongodb'
import User from '@/lib/models/User'
import { sendWelcomeEmail } from '@/lib/email/send-transactional'

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

    const { email, password, name } = await req.json()

    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: 'Email, mật khẩu và tên là bắt buộc' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Mật khẩu phải có ít nhất 6 ký tự' },
        { status: 400 }
      )
    }

    await connectDB()

    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email đã được sử dụng' },
        { status: 409 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)
    const unsubscribeToken = crypto.randomBytes(32).toString('hex')

    const user = await User.create({
      email: email.toLowerCase(),
      name,
      passwordHash,
      verificationToken,
      verificationExpires,
      unsubscribeToken,
    })

    try {
      await sendWelcomeEmail(user.email, user.name, verificationToken)
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError)
    }

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
          createdAt: user.createdAt,
        },
        token,
      },
      message: 'Đăng ký thành công',
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
    console.error('Register error:', error)
    return NextResponse.json(
      { success: false, error: 'Lỗi server, vui lòng thử lại' },
      { status: 500 }
    )
  }
}
