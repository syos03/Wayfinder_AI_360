/**
 * Admin Destination Management API - Individual Destination
 * GET /api/admin/destinations/[id] - Get destination details
 * PATCH /api/admin/destinations/[id] - Update destination
 * DELETE /api/admin/destinations/[id] - Delete destination
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { Destination } from '@/lib/models';
import { requireAdmin } from '@/lib/middleware/admin';

/**
 * GET /api/admin/destinations/[id]
 * Get destination details
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAdmin(req);
  if (error) return error;

  try {
    await connectDB();

    const { id } = await params;
    const destination = await Destination.findById(id);

    if (!destination) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy điểm đến' },
        { status: 404 }
      );
    }

    console.log('📤 GET Destination AR360 data:', {
      destinationId: destination._id,
      name: destination.name,
      streetViewLocations: destination.streetViewLocations?.length || 0,
      streetViewSpots: destination.streetViewSpots?.length || 0,
      panoramaImages: destination.panoramaImages?.length || 0,
      panoramaHotspots: destination.panoramaHotspots?.length || 0,
    });
    if (destination.panoramaHotspots?.length > 0) {
      console.log('🔗 panoramaHotspots data:', JSON.stringify(destination.panoramaHotspots, null, 2));
    }

    return NextResponse.json({
      success: true,
      data: { destination },
    });

  } catch (error: any) {
    console.error('Admin get destination error:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi server' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/destinations/[id]
 * Update destination
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user: adminUser, error } = await requireAdmin(req);
  if (error) return error;

  try {
    await connectDB();

    const { id } = await params;
    const destination = await Destination.findById(id);
    
    if (!destination) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy điểm đến' },
        { status: 404 }
      );
    }

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
      panoramaImages,
      youtubeVideos,
      panoramaHotspots,
      streetViewSpots,
      streetViewLocations,
      streetViewUrls,
      streetViewUrl,
    } = body;

    // Update fields
    if (name !== undefined) destination.name = name.trim();
    if (nameEn !== undefined) destination.nameEn = nameEn?.trim();
    if (province !== undefined) destination.province = province.trim();
    if (region !== undefined) destination.region = region;
    if (type !== undefined) destination.type = type;
    
    // Validate and convert coordinates
    if (coordinates !== undefined) {
      destination.coordinates = {
        lat: parseFloat(coordinates.lat) || 0,
        lng: parseFloat(coordinates.lng) || 0,
      };
    }
    
    if (description !== undefined) destination.description = description;
    if (highlights !== undefined) destination.highlights = highlights;
    if (bestTime !== undefined) destination.bestTime = bestTime;
    if (duration !== undefined) destination.duration = duration;
    
    // Validate and convert budget
    if (budget !== undefined) {
      destination.budget = {
        low: parseFloat(budget.low) || 0,
        medium: parseFloat(budget.medium) || 0,
        high: parseFloat(budget.high) || 0,
      };
    }
    
    if (activities !== undefined) destination.activities = activities;
    if (specialties !== undefined) destination.specialties = specialties;
    if (images !== undefined) destination.images = images;
    if (tips !== undefined) destination.tips = tips;
    if (transportation !== undefined) destination.transportation = transportation;
    if (accommodation !== undefined) destination.accommodation = accommodation;
    if (warnings !== undefined) destination.warnings = warnings;
    if (isActive !== undefined) destination.isActive = isActive;
    
    // Phase 8.5+: AR360 fields
    if (panoramaImages !== undefined) destination.panoramaImages = panoramaImages;
    if (youtubeVideos !== undefined) destination.youtubeVideos = youtubeVideos;
    if (panoramaHotspots !== undefined) {
      console.log('🔗 Received panoramaHotspots:', JSON.stringify(panoramaHotspots, null, 2));
      if (Array.isArray(panoramaHotspots) && panoramaHotspots.length === 0) {
        // Explicitly clear hotspots if empty array is sent
        console.log('🗑️ Clearing panoramaHotspots (empty array received)');
        destination.panoramaHotspots = [];
        destination.markModified('panoramaHotspots');
      } else if (Array.isArray(panoramaHotspots) && panoramaHotspots.length > 0) {
        const normalizedHotspots = panoramaHotspots
          .map((h: any) => {
            const normalized = {
              from: (h?.from || '').toString().trim(),
              to: (h?.to || '').toString().trim(),
              yaw: Number(h?.yaw) || 0,
              pitch: Number(h?.pitch) || 0,
              label: h?.label ? (h.label.toString().trim() || undefined) : undefined,
            };
            console.log('  📍 Normalizing hotspot:', JSON.stringify(normalized));
            return normalized;
          })
          .filter((h) => {
            const isValid = h.from.length > 0 && h.to.length > 0;
            if (!isValid) {
              console.log('⚠️ Filtered out invalid hotspot:', JSON.stringify(h));
            }
            return isValid;
          });
        console.log('✅ Normalized panoramaHotspots:', JSON.stringify(normalizedHotspots, null, 2));
        destination.panoramaHotspots = normalizedHotspots;
        destination.markModified('panoramaHotspots');
      } else {
        console.log('⚠️ panoramaHotspots is not a valid array, ignoring');
      }
    }
    
    // Phase 9+: Enhanced Street View Locations
    // Check if streetViewLocations is provided AND has items (not empty array)
    if (streetViewLocations !== undefined && Array.isArray(streetViewLocations) && streetViewLocations.length > 0) {
      console.log('🗺️ Received streetViewLocations:', streetViewLocations);
      const normalizedLocations = streetViewLocations
        .map((loc: any) => ({
          id: loc?.id || Date.now().toString() + Math.random().toString(36),
          url: (loc?.url || '').toString().trim(),
          title: (loc?.title || '').toString().trim(),
          description: (loc?.description || '').toString().trim(),
          category: (loc?.category || '').toString().trim(),
          coordinates: loc?.coordinates
            ? {
                lat: parseFloat(loc.coordinates.lat) || 0,
                lng: parseFloat(loc.coordinates.lng) || 0,
              }
            : undefined,
        }))
        .filter((loc) => loc.url.length > 0 && loc.title.length > 0);
      destination.streetViewLocations = normalizedLocations;
      destination.markModified('streetViewLocations');
      console.log('✅ Normalized streetViewLocations saved:', destination.streetViewLocations);
    } else if (streetViewLocations !== undefined && Array.isArray(streetViewLocations) && streetViewLocations.length === 0) {
      // Explicitly clear streetViewLocations if empty array is sent
      destination.streetViewLocations = [];
      destination.markModified('streetViewLocations');
      console.log('🗑️ Cleared streetViewLocations (empty array received)');
    }
    
    // Handle streetViewSpots (basic mode) - process independently
    if (streetViewSpots !== undefined) {
      console.log('🛰️ Received streetViewSpots:', streetViewSpots);
      const normalizedSpots = Array.isArray(streetViewSpots) ? streetViewSpots : [];
      destination.streetViewSpots = normalizedSpots
        .map((spot: any) => {
          // Extract URL from iframe if needed
          let url = (spot?.url || '').toString().trim();
          if (url.includes('<iframe')) {
            const srcMatch = url.match(/src=["']([^"']+)["']/);
            if (srcMatch) {
              url = srcMatch[1];
            }
          }
          return {
            url: url,
            title: (spot?.title || '').toString().trim(),
          };
        })
        .filter((spot) => spot.url.length > 0);
      // Keep legacy string array in sync for backwards compatibility
      destination.streetViewUrls = destination.streetViewSpots.map((spot) => spot.url);
      destination.markModified('streetViewSpots');
      destination.markModified('streetViewUrls');
      console.log('✅ Normalized streetViewSpots saved:', destination.streetViewSpots);
    }
    
    // Handle legacy streetViewUrls (only if streetViewSpots was not provided)
    if (streetViewSpots === undefined && (streetViewUrls !== undefined || streetViewUrl !== undefined)) {
      const urlsSource = streetViewUrls ?? (streetViewUrl ? [streetViewUrl] : []);
      const normalizedUrls = (Array.isArray(urlsSource) ? urlsSource : [urlsSource])
        .map((url) => (url || '').toString().trim())
        .filter((url) => url.length > 0);
      destination.streetViewUrls = normalizedUrls;
      destination.streetViewSpots = normalizedUrls.map((url) => ({ url, title: '' }));
      destination.markModified('streetViewSpots');
      destination.markModified('streetViewUrls');
      console.log('♻️ Converted legacy streetViewUrls:', destination.streetViewSpots);
    }

    console.log('💾 Saving destination with data:', {
      coordinates: destination.coordinates,
      budget: destination.budget,
      images: destination.images?.length,
      streetViewLocations: destination.streetViewLocations?.length,
      streetViewSpots: destination.streetViewSpots?.length,
      panoramaHotspots: destination.panoramaHotspots?.length || 0,
    });
    if (destination.panoramaHotspots?.length > 0) {
      console.log('🔗 Saving panoramaHotspots:', JSON.stringify(destination.panoramaHotspots, null, 2));
    }

    await destination.save();

    // Re-fetch to ensure we return the latest data
    const savedDestination = await Destination.findById(destination._id);

    console.log('✅ Saved successfully. Returning data:', {
      streetViewLocations: savedDestination?.streetViewLocations?.length || 0,
      streetViewSpots: savedDestination?.streetViewSpots?.length || 0,
      panoramaHotspots: savedDestination?.panoramaHotspots?.length || 0,
    });
    if (savedDestination?.panoramaHotspots?.length > 0) {
      console.log('🔗 Returned panoramaHotspots:', JSON.stringify(savedDestination.panoramaHotspots, null, 2));
    }

    return NextResponse.json({
      success: true,
      data: { destination: savedDestination },
      message: 'Cập nhật điểm đến thành công',
    });

  } catch (error: any) {
    console.error('❌ Admin update destination error:', error);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    
    // Log validation errors if it's a Mongoose error
    if (error.name === 'ValidationError') {
      console.error('❌ Validation errors:', error.errors);
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Lỗi server',
        details: error.errors || null
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/destinations/[id]
 * Delete destination (hard delete - permanently remove from database)
 * Also removes related data: reviews, views, favorites, trip plans
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user: adminUser, error } = await requireAdmin(req);
  if (error) return error;

  try {
    await connectDB();

    const { id } = await params;
    const destination = await Destination.findById(id);
    
    if (!destination) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy điểm đến' },
        { status: 404 }
      );
    }

    // Import related models
    const { Review, DestinationView, User, SearchHistory } = await import('@/lib/models');
    const TripPlan = (await import('@/lib/models/TripPlan')).default;

    // Delete related data in parallel
    await Promise.all([
      // Delete all reviews for this destination
      Review.deleteMany({ destinationId: id }),
      
      // Delete all views for this destination
      DestinationView.deleteMany({ destinationId: id }),
      
      // Remove from user favorites
      User.updateMany(
        { favorites: id },
        { $pull: { favorites: id } }
      ),
      
      // Remove from trip plans
      TripPlan.updateMany(
        { destinations: id },
        { $pull: { destinations: id } }
      ),
      
      // Remove from search history clicked destinations
      SearchHistory.updateMany(
        { clickedDestinations: id },
        { $pull: { clickedDestinations: id } }
      ),
    ]);

    // Hard delete: permanently remove from database
    await Destination.findByIdAndDelete(id);

    console.log(`✅ Deleted destination ${id} and all related data`);

    return NextResponse.json({
      success: true,
      message: 'Xóa điểm đến thành công',
    });

  } catch (error: any) {
    console.error('Admin delete destination error:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi server' },
      { status: 500 }
    );
  }
}

