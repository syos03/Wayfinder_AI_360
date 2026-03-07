/**
 * DestinationViews Model
 * Track destination page views for trending/popularity analytics
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IDestinationView extends Document {
  destinationId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  source: string; // 'search', 'recommendation', 'direct', 'explore', 'profile'
  viewedAt: Date;
  sessionId?: string; // For anonymous tracking
}

const DestinationViewSchema = new Schema<IDestinationView>(
  {
    destinationId: {
      type: Schema.Types.ObjectId,
      ref: 'Destination',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null, // Null for anonymous users
    },
    source: {
      type: String,
      enum: ['search', 'recommendation', 'direct', 'explore', 'profile', 'review', 'similar'],
      default: 'direct',
    },
    viewedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    sessionId: {
      type: String,
      default: null, // For tracking anonymous users
    },
  },
  {
    timestamps: false, // We use viewedAt instead
  }
);

// Indexes for analytics
DestinationViewSchema.index({ destinationId: 1, viewedAt: -1 });
DestinationViewSchema.index({ userId: 1, viewedAt: -1 });
DestinationViewSchema.index({ source: 1 });
DestinationViewSchema.index({ viewedAt: -1 });

// Compound index for trending calculations
DestinationViewSchema.index({ destinationId: 1, viewedAt: -1, source: 1 });

export default mongoose.models.DestinationView ||
  mongoose.model<IDestinationView>('DestinationView', DestinationViewSchema);

