/**
 * Script to apply Street View format from "Đại Nội Huế" to other destinations
 * This will copy the category and description structure to other destinations
 * while keeping their unique URLs and titles
 * 
 * Usage: npm run apply-hue-template
 */

const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

import { connectDB } from '../lib/db/mongodb';
import { Destination } from '../lib/models';

async function applyHueTemplate() {
  try {
    await connectDB();
    console.log('🔌 Connected to database');

    // Find Đại Nội Huế
    const hueDestination = await Destination.findOne({
      name: { $regex: /Đại Nội Huế|Dai Noi Hue/i },
    });

    if (!hueDestination) {
      console.error('❌ Không tìm thấy địa điểm "Đại Nội Huế"');
      process.exit(1);
    }

    console.log(`✅ Tìm thấy: ${hueDestination.name}`);
    console.log(`📊 Số lượng streetViewLocations: ${hueDestination.streetViewLocations?.length || 0}`);

    if (!hueDestination.streetViewLocations || hueDestination.streetViewLocations.length === 0) {
      console.error('❌ Đại Nội Huế không có streetViewLocations');
      process.exit(1);
    }

    // Get template structure - analyze all locations to find common patterns
    const hueLocations = hueDestination.streetViewLocations || [];
    
    // Find most common category
    const categoryCounts: Record<string, number> = {};
    hueLocations.forEach((loc: any) => {
      if (loc.category) {
        categoryCounts[loc.category] = (categoryCounts[loc.category] || 0) + 1;
      }
    });
    const mostCommonCategory = Object.keys(categoryCounts).sort((a, b) => categoryCounts[b] - categoryCounts[a])[0] || '';
    
    // Get template description pattern (from first location with description)
    const templateLocation = hueLocations.find((loc: any) => loc.description) || hueLocations[0];
    const templateDescription = templateLocation?.description || '';

    console.log('\n📋 Template từ Đại Nội Huế:');
    console.log(`   Số lượng locations: ${hueLocations.length}`);
    console.log(`   Category phổ biến: ${mostCommonCategory}`);
    console.log(`   Description mẫu: ${templateDescription.substring(0, 80)}...`);

    // Find all other destinations
    const otherDestinations = await Destination.find({
      _id: { $ne: hueDestination._id },
      $or: [
        { streetViewLocations: { $exists: true, $ne: [] } },
        { streetViewSpots: { $exists: true, $ne: [] } },
      ],
    });

    console.log(`\n🔍 Tìm thấy ${otherDestinations.length} địa điểm khác`);

    let updatedCount = 0;

    for (const dest of otherDestinations) {
      let hasChanges = false;

      // Update streetViewLocations if exists
      if (dest.streetViewLocations && dest.streetViewLocations.length > 0) {
        const updatedLocations = dest.streetViewLocations.map((location: any) => {
          const needsCategory = !location.category && mostCommonCategory;
          const needsDescription = !location.description && templateDescription;
          
          if (needsCategory || needsDescription) {
            hasChanges = true;
            return {
              ...location,
              category: location.category || mostCommonCategory,
              description: location.description || templateDescription,
            };
          }
          return location;
        });

        if (hasChanges) {
          dest.streetViewLocations = updatedLocations;
          dest.markModified('streetViewLocations');
        }
      }

      // Convert streetViewSpots to streetViewLocations if needed
      if (dest.streetViewSpots && dest.streetViewSpots.length > 0 && (!dest.streetViewLocations || dest.streetViewLocations.length === 0)) {
        hasChanges = true;
        dest.streetViewLocations = dest.streetViewSpots.map((spot: any, index: number) => ({
          id: `spot-${Date.now()}-${index}`,
          url: spot.url,
          title: spot.title || `Góc nhìn ${index + 1}`,
          description: templateDescription,
          category: mostCommonCategory,
          coordinates: dest.coordinates,
        }));
        dest.markModified('streetViewLocations');
        console.log(`   🔄 Đã chuyển đổi streetViewSpots sang streetViewLocations: ${dest.name}`);
      }

      if (hasChanges) {
        await dest.save();
        updatedCount++;
        console.log(`   ✅ Đã cập nhật: ${dest.name}`);
      }
    }

    console.log(`\n✨ Hoàn thành! Đã cập nhật ${updatedCount} địa điểm`);
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the script
applyHueTemplate();

