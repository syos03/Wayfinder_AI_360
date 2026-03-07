/**
 * Admin Destination Management API
 * GET /api/admin/destinations - List all destinations
 * POST /api/admin/destinations - Create new destination
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { Destination } from '@/lib/models';
import { requireAdmin } from '@/lib/middleware/admin';

/**
 * GET /api/admin/destinations
 * List all destinations with pagination, filtering, and search
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
    const region = searchParams.get('region') || '';
    const type = searchParams.get('type') || '';
    const isActive = searchParams.get('isActive');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build query
    const query: any = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { nameEn: { $regex: search, $options: 'i' } },
        { province: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (region) query.region = region;
    if (type) query.type = type;
    if (isActive !== null && isActive !== undefined) query.isActive = isActive === 'true';

    // Count total
    const total = await Destination.countDocuments(query);

    // Get destinations
    const destinations = await Destination.find(query)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({
      success: true,
      data: {
        destinations,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });

  } catch (error: any) {
    console.error('Admin get destinations error:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi server' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/destinations
 * Create new destination
 */
export async function POST(req: NextRequest) {
  const { user: adminUser, error } = await requireAdmin(req);
  if (error) return error;

  try {
    await connectDB();

    const body = await req.json();
    const {
      name,
      nameEn,
      province,
      region,
      type,
      coordinates,
      description,
      highlights,
      bestTime,
      duration,
      budget,
      activities,
      specialties,
      images,
      tips,
      transportation,
      accommodation,
      warnings,
      isActive,
    } = body;

    // Validation
    if (!name || !province || !region || !type || !description) {
      return NextResponse.json(
        { success: false, error: 'Thiếu thông tin bắt buộc' },
        { status: 400 }
      );
    }

    if (!coordinates || !coordinates.lat || !coordinates.lng) {
      return NextResponse.json(
        { success: false, error: 'Tọa độ là bắt buộc' },
        { status: 400 }
      );
    }

    // Check if destination already exists
    const existingDestination = await Destination.findOne({ 
      name: name.trim(),
      province: province.trim(),
    });
    
    if (existingDestination) {
      return NextResponse.json(
        { success: false, error: 'Điểm đến đã tồn tại trong tỉnh này' },
        { status: 409 }
      );
    }

    // Create destination
    const newDestination = await Destination.create({
      name: name.trim(),
      nameEn: nameEn?.trim(),
      province: province.trim(),
      region,
      type,
      coordinates,
      description,
      highlights: highlights || [],
      bestTime: bestTime || [],
      duration: duration || 'Chưa xác định',
      budget: budget || { low: 0, medium: 0, high: 0 },
      activities: activities || [],
      specialties: specialties || [],
      rating: 0,
      reviewCount: 0,
      images: images || [],
      tips: tips || [],
      transportation: transportation || {},
      accommodation: accommodation || {},
      warnings: warnings || [],
      isActive: isActive !== undefined ? isActive : true,
    });

    return NextResponse.json({
      success: true,
      data: { destination: newDestination },
      message: 'Tạo điểm đến thành công',
    }, { status: 201 });

  } catch (error: any) {
    console.error('Admin create destination error:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi server' },
      { status: 500 }
    );
  }
}

