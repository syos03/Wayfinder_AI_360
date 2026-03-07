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

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json()

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: 'Email, password và tên là bắt buộc' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Mật khẩu phải có ít nhất 6 ký tự' },
        { status: 400 }
      )
    }

    // Connect to MongoDB
    await connectDB()

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email đã được sử dụng' },
        { status: 409 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Generate verification token (24 hours)
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)

    // Generate unsubscribe token
    const unsubscribeToken = crypto.randomBytes(32).toString('hex')

    // Create user
    const user = await User.create({
      email: email.toLowerCase(),
      name,
      passwordHash,
      verificationToken,
      verificationExpires,
      unsubscribeToken,
    })

    // Send welcome + verification email
    try {
      await sendWelcomeEmail(user.email, user.name, verificationToken)
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError)
      // Don't fail registration if email fails
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id.toString(),
        email: user.email 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as string & jwt.SignOptions['expiresIn'] }
    )

    // Create response
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

    // Set HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
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
