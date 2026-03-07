/**
 * Destination Model - MongoDB/Mongoose
 */

import mongoose, { Schema, Document } from 'mongoose'

export interface IDestination extends Document {
  name: string
  nameEn?: string
  province: string
  region: string
  type: string
  coordinates: {
    lat: number
    lng: number
  }
  description: string
  highlights: string[]
  bestTime: string[]
  duration: string
  budget: {
    low: number
    medium: number
    high: number
  }
  activities: string[]
  specialties: string[]
  rating: number
  reviewCount: number
  images: string[]
  tips: string[]
  transportation?: {
    train?: {
      info?: string
      cost?: string
    }
    bus?: {
      info?: string
      cost?: string
    }
    flight?: {
      info?: string
      cost?: string
    }
  }
  accommodation?: {
    hostel?: string
    hotel?: string
    resort?: string
  }
  warnings?: string[]
  isActive: boolean
  
  // Phase 4: Search & Analytics fields
  tags: string[] // Activity/feature tags for discovery
  views: number // Total view count
  clicks: number // Total click count from search
  trendingScore: number // Calculated trending score
  
  // Phase 8.5: AR360 Virtual Tour fields
  panoramaImages?: string[] // 360° panoramic image URLs
  youtubeVideos?: Array<{
    videoId: string
    title: string
    is360: boolean
  }>
  panoramaHotspots?: Array<{
    from: string
    to: string
    yaw: number
    pitch: number
    label?: string
  }>
  streetViewSpots?: Array<{
    url: string
    title?: string
  }>
  // Phase 9+: Enhanced Street View locations with detailed info
  streetViewLocations?: Array<{
    id?: string
    url: string
    title: string
    description?: string
    category?: string // e.g., "Cổng chính", "Quảng trường", "Bãi biển"
    coordinates?: {
      lat: number
      lng: number
    }
  }>
  streetViewUrls?: string[] // Legacy support (deprecated)
  
  createdAt: Date
  updatedAt: Date
}

const DestinationSchema = new Schema<IDestination>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    nameEn: {
      type: String,
      trim: true,
    },
    province: {
      type: String,
      required: true,
    },
    region: {
      type: String,
      required: true,
      enum: ['Bắc Bộ', 'Trung Bộ', 'Nam Bộ'],
    },
    type: {
      type: String,
      required: true,
    },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    description: {
      type: String,
      required: true,
    },
    highlights: [String],
    bestTime: [String],
    duration: String,
    budget: {
      low: { type: Number, default: 0 },
      medium: { type: Number, default: 0 },
      high: { type: Number, default: 0 },
    },
    activities: [String],
    specialties: [String],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    images: [String],
    tips: [String],
    transportation: {
      train: {
        info: String,
        cost: String,
      },
      bus: {
        info: String,
        cost: String,
      },
      flight: {
        info: String,
        cost: String,
      },
    },
    accommodation: {
      hostel: String,
      hotel: String,
      resort: String,
    },
    warnings: [String],
    isActive: {
      type: Boolean,
      default: true,
    },
    
    // Phase 4: Search & Analytics fields
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    views: {
      type: Number,
      default: 0,
      index: true,
    },
    clicks: {
      type: Number,
      default: 0,
    },
    trendingScore: {
      type: Number,
      default: 0,
      index: true,
    },
    
    // Phase 8.5: AR360 Virtual Tour fields
    panoramaImages: {
      type: [String],
      default: [],
    },
    youtubeVideos: {
      type: [{
        videoId: { type: String, required: true },
        title: { type: String, required: true },
        is360: { type: Boolean, default: false },
      }],
      default: [],
    },
    panoramaHotspots: {
      type: [{
        from: { type: String, required: true },
        to: { type: String, required: true },
        yaw: { type: Number, default: 0 },
        pitch: { type: Number, default: 0 },
        label: { type: String, default: '' },
      }],
      default: [],
    },
    streetViewSpots: {
      type: [{
        url: { type: String, required: true },
        title: { type: String, default: '' },
      }],
      default: [],
    },
    // Phase 9+: Enhanced Street View locations with detailed info
    streetViewLocations: {
      type: [{
        id: { type: String },
        url: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String, default: '' },
        category: { type: String, default: '' },
        coordinates: {
          lat: { type: Number },
          lng: { type: Number },
        },
      }],
      default: [],
    },
    streetViewUrls: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
)

// Compound indexes for search
DestinationSchema.index({ name: 'text', description: 'text', province: 'text' })
DestinationSchema.index({ province: 1, region: 1 })
DestinationSchema.index({ rating: -1, reviewCount: -1 })
DestinationSchema.index({ 'budget.medium': 1 })

// In dev/hot-reload environments, ensure schema updates (e.g. new fields) are applied
const existingModel = mongoose.models.Destination as mongoose.Model<IDestination> | undefined
if (existingModel) {
  const hasStreetViewSpots = !!existingModel.schema.path('streetViewSpots')
  if (!hasStreetViewSpots) {
    delete mongoose.models.Destination
  }
}

export default (mongoose.models.Destination as mongoose.Model<IDestination> | undefined) ||
  mongoose.model<IDestination>('Destination', DestinationSchema)

