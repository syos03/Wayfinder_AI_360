/**
 * Admin Middleware
 * Checks if user has admin/moderator/super_admin role
 */

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/db/mongodb';
import { User } from '@/lib/models';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not configured. Please set it in your environment variables.');
}

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string;
    email: string;
    name: string;
    role: string;
    permissions: string[];
  };
}

/**
 * Verify JWT token and attach user to request
 */
export async function authenticateUser(req: NextRequest): Promise<{ user: any; error?: string }> {
  try {
    // Get token from cookie
    const token = req.cookies.get('auth-token')?.value;
    
    if (!token) {
      return { user: null, error: 'Unauthorized - No token provided' };
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    
    // Connect to DB and get user
    await connectDB();
    const user = await User.findById(decoded.userId).select('-passwordHash');
    
    if (!user) {
      return { user: null, error: 'User not found' };
    }

    if (!user.isActive) {
      return { user: null, error: 'Account is deactivated' };
    }

    if (user.isBanned) {
      return { user: null, error: 'Account is banned' };
    }

    return { 
      user: {
        userId: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        permissions: user.permissions,
        avatar: user.avatar,
      } 
    };
  } catch (error: any) {
    console.error('Authentication error:', error);
    return { user: null, error: 'Invalid token' };
  }
}

/**
 * Check if user has admin role (admin, moderator, or super_admin)
 */
export async function requireAdmin(req: NextRequest): Promise<{ user: any; error?: NextResponse }> {
  const { user, error } = await authenticateUser(req);
  
  if (error || !user) {
    return { 
      user: null, 
      error: NextResponse.json(
        { success: false, error: error || 'Unauthorized' }, 
        { status: 401 }
      ) 
    };
  }

  const allowedRoles = ['admin', 'moderator', 'super_admin'];
  if (!allowedRoles.includes(user.role)) {
    return { 
      user: null, 
      error: NextResponse.json(
        { success: false, error: 'Forbidden - Admin access required' }, 
        { status: 403 }
      ) 
    };
  }

  return { user };
}

/**
 * Check if user has super_admin role
 */
export async function requireSuperAdmin(req: NextRequest): Promise<{ user: any; error?: NextResponse }> {
  const { user, error } = await authenticateUser(req);
  
  if (error || !user) {
    return { 
      user: null, 
      error: NextResponse.json(
        { success: false, error: error || 'Unauthorized' }, 
        { status: 401 }
      ) 
    };
  }

  if (user.role !== 'super_admin') {
    return { 
      user: null, 
      error: NextResponse.json(
        { success: false, error: 'Forbidden - Super Admin access required' }, 
        { status: 403 }
      ) 
    };
  }

  return { user };
}

/**
 * Check if user has specific permission
 */
export async function requirePermission(req: NextRequest, permission: string): Promise<{ user: any; error?: NextResponse }> {
  const { user, error } = await authenticateUser(req);
  
  if (error || !user) {
    return { 
      user: null, 
      error: NextResponse.json(
        { success: false, error: error || 'Unauthorized' }, 
        { status: 401 }
      ) 
    };
  }

  // Super admin has all permissions
  if (user.role === 'super_admin') {
    return { user };
  }

  // Check if user has the required permission
  if (!user.permissions.includes(permission)) {
    return { 
      user: null, 
      error: NextResponse.json(
        { success: false, error: `Forbidden - Permission '${permission}' required` }, 
        { status: 403 }
      ) 
    };
  }

  return { user };
}

/**
 * Check if user has one of the allowed roles
 * Returns { authorized: true, user } or { authorized: false, error, status }
 */
export async function checkAdmin(
  req: NextRequest, 
  allowedRoles: string[] = ['admin', 'moderator', 'super_admin']
): Promise<{ 
  authorized: boolean; 
  user?: any; 
  error?: string; 
  status?: number 
}> {
  const { user, error } = await authenticateUser(req);
  
  if (error || !user) {
    return { 
      authorized: false,
      error: error || 'Unauthorized',
      status: 401
    };
  }

  if (!allowedRoles.includes(user.role)) {
    return { 
      authorized: false,
      error: 'Forbidden - Admin access required',
      status: 403
    };
  }

  return { 
    authorized: true, 
    user: {
      id: user.userId,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: user.permissions,
      avatar: user.avatar,
    }
  };
}

/**
 * Permission constants
 */
export const PERMISSIONS = {
  // User Management
  USER_VIEW: 'user:view',
  USER_CREATE: 'user:create',
  USER_EDIT: 'user:edit',
  USER_DELETE: 'user:delete',
  USER_BAN: 'user:ban',
  
  // Content Management
  DESTINATION_VIEW: 'destination:view',
  DESTINATION_CREATE: 'destination:create',
  DESTINATION_EDIT: 'destination:edit',
  DESTINATION_DELETE: 'destination:delete',
  
  // Review Management
  REVIEW_VIEW: 'review:view',
  REVIEW_MODERATE: 'review:moderate',
  REVIEW_DELETE: 'review:delete',
  
  // Trip Plan Management
  TRIP_VIEW: 'trip:view',
  TRIP_DELETE: 'trip:delete',
  
  // System
  ANALYTICS_VIEW: 'analytics:view',
  SETTINGS_MANAGE: 'settings:manage',
};

