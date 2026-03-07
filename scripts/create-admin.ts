/**
 * Create Super Admin User Script
 * Usage: npm run create-admin
 */

const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
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

UserSchema.index({ email: 1 });
UserSchema.index({ role: 1, isActive: 1 });
UserSchema.index({ isBanned: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ lastActive: -1 });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function createSuperAdmin() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI!);
    console.log('✅ Connected to MongoDB');

    // Check if super admin already exists
    const existingAdmin = await User.findOne({ role: 'super_admin' });
    if (existingAdmin) {
      console.log('⚠️  Super Admin already exists:');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Name: ${existingAdmin.name}`);
      console.log('\nIf you want to create a new one, delete the existing one first.');
      process.exit(0);
    }

    // Super Admin credentials
    const adminData = {
      email: 'admin@wayfinder.ai',
      name: 'Super Admin',
      password: 'admin123456', // Change this in production!
      role: 'super_admin',
      permissions: [
        // User Management
        'user:view',
        'user:create',
        'user:edit',
        'user:delete',
        'user:ban',
        // Content Management
        'destination:view',
        'destination:create',
        'destination:edit',
        'destination:delete',
        // Review Management
        'review:view',
        'review:moderate',
        'review:delete',
        // Trip Plan Management
        'trip:view',
        'trip:delete',
        // System
        'analytics:view',
        'settings:manage',
      ],
    };

    console.log('\n🔐 Creating Super Admin...');
    
    // Hash password
    const passwordHash = await bcrypt.hash(adminData.password, 10);

    // Create admin user
    const admin = await User.create({
      email: adminData.email.toLowerCase(),
      name: adminData.name,
      passwordHash,
      role: adminData.role,
      permissions: adminData.permissions,
      isActive: true,
      isBanned: false,
      loginCount: 0,
    });

    console.log('\n✅ Super Admin created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('━'.repeat(50));
    console.log(`   Email:    ${adminData.email}`);
    console.log(`   Password: ${adminData.password}`);
    console.log('━'.repeat(50));
    console.log('\n⚠️  IMPORTANT: Change the password after first login!');
    console.log('\n🚀 You can now login at: http://localhost:3000/login\n');

    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);

  } catch (error: any) {
    console.error('❌ Error creating super admin:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

createSuperAdmin();

