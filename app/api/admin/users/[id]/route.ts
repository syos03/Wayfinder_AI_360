/**
 * Admin User Management API - Individual User
 * GET /api/admin/users/[id] - Get user details
 * PATCH /api/admin/users/[id] - Update user
 * DELETE /api/admin/users/[id] - Delete user
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { User } from '@/lib/models';
import { requireAdmin } from '@/lib/middleware/admin';
import bcrypt from 'bcryptjs';

/**
 * GET /api/admin/users/[id]
 * Get user details
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { user, error } = await requireAdmin(req);
  if (error) return error;

  try {
    await connectDB();

    const targetUser = await User.findById(id)
      .select('-passwordHash')
      .populate('bannedBy', 'name email');

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy người dùng' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { user: targetUser },
    });

  } catch (error: any) {
    console.error('Admin get user error:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi server' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/users/[id]
 * Update user
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { user: adminUser, error } = await requireAdmin(req);
  if (error) return error;

  try {
    await connectDB();

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy người dùng' },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { 
      name, 
      email, 
      role, 
      permissions, 
      isActive, 
      isBanned, 
      banReason,
      password,
      avatar,
      bio,
      phone,
      preferences,
    } = body;

    // 🔒 CRITICAL: Only super_admin can modify admin/super_admin accounts
    if ((targetUser.role === 'admin' || targetUser.role === 'super_admin') && adminUser.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Chỉ Super Admin mới có thể chỉnh sửa tài khoản Admin/Super Admin' },
        { status: 403 }
      );
    }

    // Only super_admin can change role to admin/super_admin
    if ((role === 'admin' || role === 'super_admin') && adminUser.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Chỉ Super Admin mới có thể gán vai trò Admin/Super Admin' },
        { status: 403 }
      );
    }

    // Prevent self-ban or self-deactivation
    if (adminUser.userId === id) {
      if (isBanned === true || isActive === false) {
        return NextResponse.json(
          { success: false, error: 'Bạn không thể tự ban hoặc vô hiệu hóa tài khoản của mình' },
          { status: 400 }
        );
      }
    }

    // Update fields
    if (name !== undefined) targetUser.name = name;
    if (email !== undefined) targetUser.email = email.toLowerCase();
    if (role !== undefined) targetUser.role = role;
    if (permissions !== undefined) targetUser.permissions = permissions;
    if (isActive !== undefined) targetUser.isActive = isActive;
    if (avatar !== undefined) targetUser.avatar = avatar;
    if (bio !== undefined) targetUser.bio = bio;
    if (phone !== undefined) targetUser.phone = phone;
    if (preferences !== undefined) targetUser.preferences = preferences;
    
    // Handle ban/unban
    if (isBanned !== undefined) {
      targetUser.isBanned = isBanned;
      if (isBanned) {
        targetUser.bannedAt = new Date();
        targetUser.bannedBy = adminUser.userId;
        if (banReason) targetUser.banReason = banReason;
      } else {
        targetUser.bannedAt = null;
        targetUser.bannedBy = null;
        targetUser.banReason = null;
      }
    }

    // Update password if provided
    if (password) {
      targetUser.passwordHash = await bcrypt.hash(password, 10);
    }

    await targetUser.save();

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: targetUser._id.toString(),
          email: targetUser.email,
          name: targetUser.name,
          role: targetUser.role,
          permissions: targetUser.permissions,
          isActive: targetUser.isActive,
          isBanned: targetUser.isBanned,
          avatar: targetUser.avatar,
          bio: targetUser.bio,
          phone: targetUser.phone,
        },
      },
      message: 'Cập nhật người dùng thành công',
    });

  } catch (error: any) {
    console.error('Admin update user error:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi server' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/users/[id]
 * Delete user (soft delete by banning)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { user: adminUser, error } = await requireAdmin(req);
  if (error) return error;

  try {
    await connectDB();

    // Prevent self-deletion
    if (adminUser.userId === id) {
      return NextResponse.json(
        { success: false, error: 'Bạn không thể xóa tài khoản của chính mình' },
        { status: 400 }
      );
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy người dùng' },
        { status: 404 }
      );
    }

    // Only super_admin can delete admin accounts
    if ((targetUser.role === 'admin' || targetUser.role === 'super_admin') && adminUser.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Chỉ Super Admin mới có thể xóa tài khoản Admin' },
        { status: 403 }
      );
    }

    // Soft delete: deactivate instead of removing
    targetUser.isActive = false;
    targetUser.isBanned = true;
    targetUser.banReason = 'Tài khoản đã bị xóa bởi quản trị viên';
    targetUser.bannedAt = new Date();
    targetUser.bannedBy = adminUser.userId;
    await targetUser.save();

    return NextResponse.json({
      success: true,
      message: 'Xóa người dùng thành công',
    });

  } catch (error: any) {
    console.error('Admin delete user error:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi server' },
      { status: 500 }
    );
  }
}

