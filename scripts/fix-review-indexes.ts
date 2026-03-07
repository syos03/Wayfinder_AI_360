/**
 * Script to fix Review collection indexes
 * Removes old indexes and bad data
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI || '';

async function fixReviewIndexes() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }
    const reviewsCollection = db.collection('reviews');

    console.log('\n📊 Checking current indexes...');
    const indexes = await reviewsCollection.indexes();
    console.log('Current indexes:', JSON.stringify(indexes, null, 2));

    // Step 1: Find and display bad records
    console.log('\n🔍 Looking for records with null entityType or entityId...');
    const badRecords = await reviewsCollection.find({
      $or: [
        { entityType: null },
        { entityId: null },
        { entityType: { $exists: false } },
        { entityId: { $exists: false } }
      ]
    }).toArray();

    console.log(`Found ${badRecords.length} bad records:`);
    badRecords.forEach((record: any) => {
      console.log({
        _id: record._id,
        userId: record.userId,
        destinationId: record.destinationId,
        entityType: record.entityType,
        entityId: record.entityId,
        rating: record.rating,
        title: record.title
      });
    });

    // Step 2: Try to drop old index if it exists
    console.log('\n🗑️ Attempting to drop old index userId_1_entityType_1_entityId_1...');
    try {
      await reviewsCollection.dropIndex('userId_1_entityType_1_entityId_1');
      console.log('✅ Dropped old index successfully');
    } catch (error: any) {
      if (error.codeName === 'IndexNotFound') {
        console.log('ℹ️ Index userId_1_entityType_1_entityId_1 not found (already removed)');
      } else {
        console.log('⚠️ Error dropping index:', error.message);
      }
    }

    // Step 3: Remove bad records
    if (badRecords.length > 0) {
      console.log(`\n🗑️ Removing ${badRecords.length} bad records...`);
      const result = await reviewsCollection.deleteMany({
        $or: [
          { entityType: null },
          { entityId: null },
          { entityType: { $exists: false } },
          { entityId: { $exists: false } }
        ]
      });
      console.log(`✅ Deleted ${result.deletedCount} records`);
    }

    // Step 4: Remove entityType and entityId fields from all remaining records
    console.log('\n🧹 Cleaning up entityType and entityId fields from remaining records...');
    const cleanupResult = await reviewsCollection.updateMany(
      {},
      {
        $unset: {
          entityType: '',
          entityId: ''
        }
      }
    );
    console.log(`✅ Updated ${cleanupResult.modifiedCount} records`);

    // Step 5: Ensure correct indexes exist
    console.log('\n📊 Ensuring correct indexes exist...');
    
    // Check if the correct unique index exists
    const correctIndexExists = indexes.some(
      (idx: any) => 
        idx.name === 'destinationId_1_userId_1' ||
        (idx.key.destinationId === 1 && idx.key.userId === 1 && idx.unique === true)
    );

    if (!correctIndexExists) {
      console.log('Creating unique index on destinationId and userId...');
      await reviewsCollection.createIndex(
        { destinationId: 1, userId: 1 },
        { unique: true }
      );
      console.log('✅ Created unique index');
    } else {
      console.log('✅ Correct unique index already exists');
    }

    // Step 6: Display final indexes
    console.log('\n📊 Final indexes:');
    const finalIndexes = await reviewsCollection.indexes();
    finalIndexes.forEach((idx: any) => {
      console.log(`- ${idx.name}: ${JSON.stringify(idx.key)} ${idx.unique ? '(unique)' : ''}`);
    });

    console.log('\n✅ All done! Review indexes have been fixed.');
    console.log('You can now create reviews without issues.');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

// Run the script
fixReviewIndexes();

