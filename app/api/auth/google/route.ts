import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { connectDB } from '@/lib/db/mongodb';
import User from '@/lib/models/User';
import jwt from 'jsonwebtoken';

const client = new OAuth2Client(
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);
const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export async function POST(req: NextRequest) {
  try {
    console.log('Google Auth API - Client ID:', process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
    console.log('Google Auth API - Client Secret present:', !!process.env.GOOGLE_CLIENT_SECRET);
    const { credential } = await req.json();

    if (!credential) {
      return NextResponse.json(
        { success: false, error: 'Google credential is required' },
        { status: 400 }
      );
    }

    // Verify Google ID Token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return NextResponse.json(
        { success: false, error: 'Invalid Google token' },
        { status: 400 }
      );
    }

    const { email, name, sub: googleId, picture: avatar } = payload;

    await connectDB();

    // Find user by email or googleId
    let user = await User.findOne({ 
      $or: [{ email: email.toLowerCase() }, { googleId }] 
    });

    if (user) {
      // Update existing user if needed
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = 'google';
        if (!user.avatar && avatar) user.avatar = avatar;
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        email: email.toLowerCase(),
        name: name || email.split('@')[0],
        googleId,
        authProvider: 'google',
        avatar,
        isActive: true,
        emailVerified: true,
        emailVerifiedAt: new Date(),
        loginCount: 0,
      });
    }

    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: 'Tài khoản đã bị vô hiệu hóa' },
        { status: 403 }
      );
    }

    if (user.isBanned) {
      return NextResponse.json(
        { success: false, error: 'Tài khoản đã bị cấm' },
        { status: 403 }
      );
    }

    // Update login stats
    user.lastLogin = new Date();
    user.loginCount = (user.loginCount || 0) + 1;
    user.lastActive = new Date();
    await user.save();

    // Generate our own JWT
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as any }
    );

    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          role: user.role,
        },
        token,
      },
    });

    // Set cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Google auth error:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi xác thực Google, vui lòng thử lại' },
      { status: 500 }
    );
  }
}
