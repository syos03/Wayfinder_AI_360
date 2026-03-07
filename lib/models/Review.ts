/**
 * Review Model - MongoDB/Mongoose
 * For destination reviews and ratings
 */

import mongoose, { Schema, Document } from 'mongoose'

export interface IReview extends Document {
  destinationId: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  userName: string
  userAvatar?: string
  rating: number
  title: string
  content: string
  photos: string[]
  helpful: number
  notHelpful: number
  helpfulBy: mongoose.Types.ObjectId[]
  notHelpfulBy: mongoose.Types.ObjectId[]
  isApproved: boolean
  isRejected: boolean
  moderatorNotes?: string
  moderatedBy?: mongoose.Types.ObjectId
  moderatedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const ReviewSchema = new Schema<IReview>(
  {
    destinationId: {
      type: Schema.Types.ObjectId,
      ref: 'Destination',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    userAvatar: {
      type: String,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    photos: [String],
    helpful: {
      type: Number,
      default: 0,
    },
    notHelpful: {
      type: Number,
      default: 0,
    },
    helpfulBy: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    notHelpfulBy: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    isApproved: {
      type: Boolean,
      default: false,
    },
    isRejected: {
      type: Boolean,
      default: false,
    },
    moderatorNotes: {
      type: String,
      trim: true,
    },
    moderatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    moderatedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes for performance
ReviewSchema.index({ destinationId: 1, createdAt: -1 })
ReviewSchema.index({ userId: 1 })
ReviewSchema.index({ isApproved: 1 })
ReviewSchema.index({ rating: 1 })

// Ensure user can only review a destination once
ReviewSchema.index({ destinationId: 1, userId: 1 }, { unique: true })

// Export model
export default mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema)
