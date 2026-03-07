/**
 * Admin User Management API
 * GET /api/admin/users - List all users
 * POST /api/admin/users - Create user (admin)
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { User } from '@/lib/models';
import { requireAdmin } from '@/lib/middleware/admin';
import bcrypt from 'bcryptjs';

/**
 * GET /api/admin/users
 * List all users with pagination, filtering, and search
 */
export async function GET(req: NextRequest) {
  const { user, error } = await requireAdmin(req);
  if (error) return error;

  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const isActive = searchParams.get('isActive');
    const isBanned = searchParams.get('isBanned');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build query
    const query: any = {};
    
    // 🔒 SECURITY: Filter users based on current user's role
    if (user.role === 'moderator') {
      // Moderator can only see regular users
      query.role = 'user';
    } else if (user.role === 'admin') {
      // Admin can see user, moderator, and admin (NOT super_admin)
      query.role = { $in: ['user', 'moderator', 'admin'] };
    }
    // Super Admin sees everyone (no role filter)
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    
    // If role filter is provided, respect role visibility rules
    if (role) {
      if (user.role === 'moderator' && role !== 'user') {
        // Moderator tries to filter by non-user role
        query.role = 'user'; // Override to only show users
      } else if (user.role === 'admin' && role === 'super_admin') {
        // Admin tries to filter by super_admin
        query.role = { $in: ['user', 'moderator', 'admin'] }; // Override to exclude super_admin
      } else {
        query.role = role;
      }
    }
    
    if (isActive !== null && isActive !== undefined) query.isActive = isActive === 'true';
    if (isBanned !== null && isBanned !== undefined) query.isBanned = isBanned === 'true';

    // Count total
    const total = await User.countDocuments(query);

    // Get users
    const users = await User.find(query)
      .select('-passwordHash')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('bannedBy', 'name email');

    return NextResponse.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });

  } catch (error: any) {
    console.error('Admin get users error:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi server' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/users
 * Create new user (by admin)
 */
export async function POST(req: NextRequest) {
  const { user: adminUser, error } = await requireAdmin(req);
  if (error) return error;

  try {
    await connectDB();

    const body = await req.json();
    const { email, name, password, role, permissions, isActive } = body;

    // Validation
    if (!email || !name || !password) {
      return NextResponse.json(
        { success: false, error: 'Email, tên và mật khẩu là bắt buộc' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email đã tồn tại' },
        { status: 409 }
      );
    }

    // Only super_admin can create admin/super_admin
    if ((role === 'admin' || role === 'super_admin') && adminUser.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Chỉ Super Admin mới có thể tạo Admin' },
        { status: 403 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await User.create({
      email: email.toLowerCase(),
      name,
      passwordHash,
      role: role || 'user',
      permissions: permissions || [],
      isActive: isActive !== undefined ? isActive : true,
    });

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: newUser._id.toString(),
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          permissions: newUser.permissions,
          isActive: newUser.isActive,
          createdAt: newUser.createdAt,
        },
      },
      message: 'Tạo người dùng thành công',
    }, { status: 201 });

  } catch (error: any) {
    console.error('Admin create user error:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi server' },
      { status: 500 }
    );
  }
}

