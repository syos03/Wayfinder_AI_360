/**
 * User Model - MongoDB/Mongoose
 */

import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  email: string
  name: string
  passwordHash?: string
  googleId?: string
  authProvider: 'local' | 'google'
  avatar?: string
  bio?: string
  
  // Profile
  coverImage?: string
  location?: {
    city?: string
    country?: string
  }
  website?: string
  socialLinks?: {
    facebook?: string
    instagram?: string
    twitter?: string
  }
  
  // Social
  followers: mongoose.Types.ObjectId[]
  following: mongoose.Types.ObjectId[]
  favorites: mongoose.Types.ObjectId[] // Favorited destinations
  badges: string[]
  
  // Stats
  stats?: {
    reviewsCount: number
    followersCount: number
    followingCount: number
    destinationsVisited: number
  }
  
  // Role & Permissions
  role: 'user' | 'admin' | 'moderator' | 'super_admin'
  permissions: string[]
  isActive: boolean
  isBanned: boolean
  banReason?: string
  bannedAt?: Date
  bannedBy?: mongoose.Types.ObjectId
  
  // Contact
  phone?: string
  
  // Email Verification
  emailVerified: boolean
  emailVerifiedAt?: Date
  verificationToken?: string
  verificationExpires?: Date
  resetPasswordToken?: string
  resetPasswordExpires?: Date
  unsubscribeToken?: string
  
  // Preferences
  preferences?: {
    travelStyle?: string
    budget?: string
    interests?: string[]
    language?: string
    currency?: string
    newsletter?: boolean
  }
  
  // Activity
  lastLogin?: Date
  loginCount: number
  lastActive?: Date
  
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: function(this: any) {
        return this.authProvider === 'local';
      },
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
      default: null,
    },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    avatar: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      maxlength: 500,
      default: null,
    },
    
    // Profile
    coverImage: {
      type: String,
      default: null,
    },
    location: {
      city: String,
      country: String,
    },
    website: {
      type: String,
      default: null,
    },
    socialLinks: {
      facebook: String,
      instagram: String,
      twitter: String,
    },
    
    // Social
    followers: {
      type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      default: [],
    },
    following: {
      type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      default: [],
    },
    favorites: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Destination' }],
      default: [],
    },
    badges: {
      type: [String],
      default: [],
    },
    
    // Stats
    stats: {
      reviewsCount: { type: Number, default: 0 },
      followersCount: { type: Number, default: 0 },
      followingCount: { type: Number, default: 0 },
      destinationsVisited: { type: Number, default: 0 },
    },
    
    // Role & Permissions
    role: {
      type: String,
      enum: ['user', 'admin', 'moderator', 'super_admin'],
      default: 'user',
    },
    permissions: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    banReason: {
      type: String,
      default: null,
    },
    bannedAt: {
      type: Date,
      default: null,
    },
    bannedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    
    // Contact
    phone: {
      type: String,
      default: null,
    },
    
    // Email Verification
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerifiedAt: {
      type: Date,
      default: null,
    },
    verificationToken: {
      type: String,
      default: null,
      sparse: true,
    },
    verificationExpires: {
      type: Date,
      default: null,
    },
    resetPasswordToken: {
      type: String,
      default: null,
      sparse: true,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
    unsubscribeToken: {
      type: String,
      default: null,
      unique: true,
      sparse: true,
    },
    
    // Preferences
    preferences: {
      type: {
        travelStyle: { type: String, default: '' },
        budget: { type: String, default: '' },
        interests: { type: [String], default: [] },
        language: { type: String, default: 'vi' },
        currency: { type: String, default: 'VND' },
        newsletter: { type: Boolean, default: true },
      },
      default: {},
      _id: false  // Prevent Mongoose from creating _id for subdocument
    },
    
    // Activity
    lastLogin: {
      type: Date,
      default: null,
    },
    loginCount: {
      type: Number,
      default: 0,
    },
    lastActive: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes
// Note: email index is already created by unique: true
UserSchema.index({ role: 1, isActive: 1 })
UserSchema.index({ isBanned: 1 })
UserSchema.index({ createdAt: -1 })
UserSchema.index({ lastActive: -1 })
UserSchema.index({ followers: 1 })
UserSchema.index({ following: 1 })
UserSchema.index({ favorites: 1 })
UserSchema.index({ 'stats.reviewsCount': -1 })
UserSchema.index({ 'stats.followersCount': -1 })

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)

