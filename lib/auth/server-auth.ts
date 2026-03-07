/**
 * Server-Side Authentication Helpers
 * For use in API routes ONLY - NOT in client components!
 */

import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { connectDB } from '@/lib/db/mongodb'
import { User as UserModel } from '@/lib/models'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not configured. Please set it in your environment variables.')
}

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  bio?: string
  role?: string
  createdAt: Date
}

/**
 * Get current user from JWT cookie (SERVER-SIDE ONLY)
 * Use this in API routes, NOT in client components
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    // Get token from cookie
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    
    if (!token) {
      return null
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET as string) as { userId: string }
    
    // Connect to DB and get user
    await connectDB()
    const user = await UserModel.findById(decoded.userId).select('-passwordHash')
    
    if (!user) {
      return null
    }

    if (!user.isActive) {
      return null
    }

    if (user.isBanned) {
      return null
    }

    // Return user in consistent format
    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      bio: user.bio,
      role: user.role,
      createdAt: user.createdAt,
    }
  } catch (error: any) {
    console.error('getCurrentUser error:', error.message)
    return null
  }
}

