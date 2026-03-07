/**
 * SearchHistory Model
 * Track user search queries for analytics and recommendations
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface ISearchHistory extends Document {
  userId?: mongoose.Types.ObjectId;
  query: string;
  filters?: {
    region?: string;
    type?: string;
    budget?: {
      min?: number;
      max?: number;
    };
    rating?: number;
    duration?: string;
  };
  resultsCount: number;
  clickedDestinations: mongoose.Types.ObjectId[];
  source?: string; // 'web', 'mobile', 'autocomplete'
  createdAt: Date;
}

const SearchHistorySchema = new Schema<ISearchHistory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null, // Null for anonymous users
    },
    query: {
      type: String,
      required: true,
      trim: true,
    },
    filters: {
      region: String,
      type: String,
      budget: {
        min: Number,
        max: Number,
      },
      rating: Number,
      duration: String,
    },
    resultsCount: {
      type: Number,
      default: 0,
    },
    clickedDestinations: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Destination' }],
      default: [],
    },
    source: {
      type: String,
      default: 'web',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for analytics queries
SearchHistorySchema.index({ userId: 1, createdAt: -1 });
SearchHistorySchema.index({ query: 'text' });
SearchHistorySchema.index({ createdAt: -1 });
SearchHistorySchema.index({ resultsCount: 1 });

export default mongoose.models.SearchHistory ||
  mongoose.model<ISearchHistory>('SearchHistory', SearchHistorySchema);

