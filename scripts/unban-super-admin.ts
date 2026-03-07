x/**
 * Emergency Script: Unban Super Admin
 * Usage: npm run unban-super-admin
 */

const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in .env.local');
  process.exit(1);
}

// Define User Schema
const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    avatar: { type: String, default: null },
    bio: { type: String, maxlength: 500, default: null },
    role: {
      type: String,
      enum: ['user', 'admin', 'moderator', 'super_admin'],
      default: 'user',
    },
    permissions: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
    isBanned: { type: Boolean, default: false },
    banReason: { type: String, default: null },
    bannedAt: { type: Date, default: null },
    bannedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    phone: { type: String, default: null },
    preferences: {
      travelStyle: String,
      budget: String,
      interests: [String],
      language: { type: String, default: 'vi' },
      currency: { type: String, default: 'VND' },
      newsletter: { type: Boolean, default: true },
    },
    lastLogin: { type: Date, default: null },
    loginCount: { type: Number, default: 0 },
    lastActive: { type: Date, default: null },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function unbanSuperAdmin() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI!);
    console.log('✅ Connected to MongoDB');

    // Find Super Admin
    const superAdmin = await User.findOne({ role: 'super_admin' });
    
    if (!superAdmin) {
      console.log('❌ Super Admin not found!');
      console.log('Creating new Super Admin instead...');
      
      // Create new Super Admin if not exists
      const bcrypt = require('bcryptjs');
      const passwordHash = await bcrypt.hash('admin123456', 10);
      
      const newSuperAdmin = await User.create({
        email: 'admin@wayfinder.ai',
        name: 'Super Admin',
        passwordHash,
        role: 'super_admin',
        permissions: [
          'user:view', 'user:create', 'user:edit', 'user:delete', 'user:ban',
          'destination:view', 'destination:create', 'destination:edit', 'destination:delete',
          'review:view', 'review:moderate', 'review:delete',
          'trip:view', 'trip:delete',
          'analytics:view', 'settings:manage',
        ],
        isActive: true,
        isBanned: false,
        loginCount: 0,
      });
      
      console.log('\n✅ New Super Admin created!');
      console.log('━'.repeat(50));
      console.log(`   Email:    admin@wayfinder.ai`);
      console.log(`   Password: admin123456`);
      console.log('━'.repeat(50));
      
    } else {
      console.log(`\n📋 Found Super Admin: ${superAdmin.email}`);
      
      if (superAdmin.isBanned) {
        console.log('⚠️  Super Admin is BANNED!');
        console.log(`   Ban Reason: ${superAdmin.banReason || 'N/A'}`);
        console.log(`   Banned At: ${superAdmin.bannedAt || 'N/A'}`);
        console.log('\n🔓 Unbanning Super Admin...');
        
        // Unban
        superAdmin.isBanned = false;
        superAdmin.isActive = true;
        superAdmin.banReason = null;
        superAdmin.bannedAt = null;
        superAdmin.bannedBy = null;
        
        await superAdmin.save();
        
        console.log('✅ Super Admin has been UNBANNED!');
      } else {
        console.log('✅ Super Admin is NOT banned (already active)');
      }
      
      // Show current status
      console.log('\n📊 Current Super Admin Status:');
      console.log('━'.repeat(50));
      console.log(`   Email:     ${superAdmin.email}`);
      console.log(`   Name:      ${superAdmin.name}`);
      console.log(`   Role:      ${superAdmin.role}`);
      console.log(`   Active:    ${superAdmin.isActive ? '✅ Yes' : '❌ No'}`);
      console.log(`   Banned:    ${superAdmin.isBanned ? '❌ Yes' : '✅ No'}`);
      console.log(`   Logins:    ${superAdmin.loginCount || 0}`);
      console.log('━'.repeat(50));
    }
    
    console.log('\n🚀 You can now login at: http://localhost:3000/login');
    console.log('   Email: admin@wayfinder.ai');
    console.log('   Password: admin123456\n');

    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

unbanSuperAdmin();

