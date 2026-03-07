/**
 * Script to add tags to existing destinations
 * Run: node scripts/add-tags-to-destinations.js
 */

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Define Destination schema (simplified)
const destinationSchema = new mongoose.Schema({
  name: String,
  type: String,
  tags: [String],
}, { strict: false });

const Destination = mongoose.models.Destination || mongoose.model('Destination', destinationSchema);

// Tag mapping based on type and keywords
const getTagsForDestination = (destination) => {
  const tags = [];
  const { type, name, description = '' } = destination;
  const text = `${name} ${description}`.toLowerCase();

  // Map type to primary tag
  const typeTagMap = {
    'Biển': 'Biển',
    'Núi': 'Núi',
    'Thành phố': 'Thành phố',
    'Văn hóa': 'Văn hóa',
    'Thiên nhiên': 'Thiên nhiên',
    'Lịch sử': 'Lịch sử',
    'Ẩm thực': 'Ẩm thực',
    'Nghỉ dưỡng': 'Nghỉ dưỡng',
  };

  // Add primary tag from type
  if (typeTagMap[type]) {
    tags.push(typeTagMap[type]);
  }

  // Add secondary tags based on content
  if (text.includes('biển') || text.includes('bãi') || text.includes('đảo')) {
    if (!tags.includes('Biển')) tags.push('Biển');
  }

  if (text.includes('núi') || text.includes('đèo') || text.includes('cao nguyên')) {
    if (!tags.includes('Núi')) tags.push('Núi');
  }

  if (text.includes('chùa') || text.includes('đền') || text.includes('lịch sử') || text.includes('cổ')) {
    if (!tags.includes('Lịch sử')) tags.push('Lịch sử');
  }

  if (text.includes('ẩm thực') || text.includes('món') || text.includes('đặc sản')) {
    if (!tags.includes('Ẩm thực')) tags.push('Ẩm thực');
  }

  if (text.includes('nghỉ dưỡng') || text.includes('resort') || text.includes('spa')) {
    if (!tags.includes('Nghỉ dưỡng')) tags.push('Nghỉ dưỡng');
  }

  if (text.includes('phố cổ') || text.includes('thành phố') || text.includes('đô thị')) {
    if (!tags.includes('Thành phố')) tags.push('Thành phố');
  }

  if (text.includes('rừng') || text.includes('vườn quốc gia') || text.includes('thiên nhiên')) {
    if (!tags.includes('Thiên nhiên')) tags.push('Thiên nhiên');
  }

  if (text.includes('văn hóa') || text.includes('truyền thống') || text.includes('lễ hội')) {
    if (!tags.includes('Văn hóa')) tags.push('Văn hóa');
  }

  // If no tags found, use type as fallback
  if (tags.length === 0 && type) {
    tags.push(type);
  }

  return tags;
};

// Main function
const addTagsToDestinations = async () => {
  try {
    await connectDB();

    console.log('📊 Fetching all destinations...');
    const destinations = await Destination.find({});
    console.log(`Found ${destinations.length} destinations\n`);

    let updated = 0;
    let skipped = 0;

    for (const dest of destinations) {
      // Skip if already has tags
      if (dest.tags && dest.tags.length > 0) {
        console.log(`⏭️  Skipped: ${dest.name} (already has tags)`);
        skipped++;
        continue;
      }

      // Generate tags
      const tags = getTagsForDestination(dest);

      // Update destination
      await Destination.updateOne(
        { _id: dest._id },
        { $set: { tags } }
      );

      console.log(`✅ Updated: ${dest.name}`);
      console.log(`   Type: ${dest.type}`);
      console.log(`   Tags: ${tags.join(', ')}\n`);
      updated++;
    }

    console.log('\n🎉 DONE!');
    console.log(`✅ Updated: ${updated} destinations`);
    console.log(`⏭️  Skipped: ${skipped} destinations (already had tags)`);

    // Summary by tag
    console.log('\n📊 Summary by tag:');
    const allDestinations = await Destination.find({});
    const tagCounts = {};

    allDestinations.forEach(dest => {
      if (dest.tags) {
        dest.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([tag, count]) => {
        console.log(`   ${tag}: ${count} điểm đến`);
      });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

// Run
addTagsToDestinations();

