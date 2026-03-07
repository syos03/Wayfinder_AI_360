/**
 * Test script to check if panoramaHotspots are being saved correctly
 * Run: node scripts/test-hotspot-save.js <destinationId>
 */

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wayfinder';

async function testHotspotSave(destinationId) {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    const destinations = db.collection('destinations');
    
    const destination = await destinations.findOne({ _id: destinationId });
    
    if (!destination) {
      console.error('❌ Destination not found:', destinationId);
      return;
    }
    
    console.log('\n📊 Destination Info:');
    console.log('  Name:', destination.name);
    console.log('  Panorama Images:', destination.panoramaImages?.length || 0);
    console.log('  Panorama Hotspots:', destination.panoramaHotspots?.length || 0);
    
    if (destination.panoramaHotspots?.length > 0) {
      console.log('\n🔗 Hotspots:');
      destination.panoramaHotspots.forEach((h, i) => {
        console.log(`  ${i + 1}. From: "${h.from}" → To: "${h.to}" (Yaw: ${h.yaw}°, Pitch: ${h.pitch}°)`);
        if (h.label) console.log(`     Label: "${h.label}"`);
      });
    } else {
      console.log('\n⚠️ No hotspots found in database!');
    }
    
    if (destination.panoramaImages?.length > 0) {
      console.log('\n📸 Panorama Images:');
      destination.panoramaImages.forEach((img, i) => {
        console.log(`  ${i + 1}. ${img}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

const destinationId = process.argv[2];
if (!destinationId) {
  console.error('Usage: node scripts/test-hotspot-save.js <destinationId>');
  process.exit(1);
}

testHotspotSave(destinationId);

