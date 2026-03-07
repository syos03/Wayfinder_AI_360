/**
 * Trip Plan Model - AI Generated Travel Plans
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface ITripPlan extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  origin: string;
  destinations: mongoose.Types.ObjectId[];
  days: number;
  budget: number;
  startDate: Date;
  endDate?: Date;
  travelers: number;
  travelStyle: string;
  interests: string[];

  itinerary: {
    day: number;
    date: Date;
    morning: {
      activities: string[];
      destinations: mongoose.Types.ObjectId[];
      estimatedCost: number;
    };
    afternoon: {
      activities: string[];
      destinations: mongoose.Types.ObjectId[];
      estimatedCost: number;
    };
    evening: {
      activities: string[];
      destinations: mongoose.Types.ObjectId[];
      estimatedCost: number;
    };
    accommodation: string;
    totalDayCost: number;
  }[];

  transportation: {
    type: string;
    details: string;
    cost: number;
  };

  budgetBreakdown: {
    transportation: number;
    accommodation: number;
    food: number;
    activities: number;
    other: number;
    total: number;
  };

  tips: string[];
  warnings: string[];

  aiGenerated: boolean;
  aiModel: string;

  isPublic: boolean;
  likes: number;
  views: number;

  createdAt: Date;
  updatedAt: Date;
}

const TripPlanSchema = new Schema<ITripPlan>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    origin: {
      type: String,
      required: true,
    },
    destinations: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Destination',
      },
    ],
    days: {
      type: Number,
      required: true,
    },
    budget: {
      type: Number,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },
    travelers: {
      type: Number,
      required: true,
      default: 1,
    },
    travelStyle: {
      type: String,
      default: 'Khám phá',
    },
    interests: {
      type: [String],
      default: [],
    },

    itinerary: [
      {
        day: { type: Number, required: true },
        date: { type: Date, required: true },
        morning: {
          activities: [String],
          destinations: [{ type: Schema.Types.ObjectId, ref: 'Destination' }],
          estimatedCost: { type: Number, default: 0 },
        },
        afternoon: {
          activities: [String],
          destinations: [{ type: Schema.Types.ObjectId, ref: 'Destination' }],
          estimatedCost: { type: Number, default: 0 },
        },
        evening: {
          activities: [String],
          destinations: [{ type: Schema.Types.ObjectId, ref: 'Destination' }],
          estimatedCost: { type: Number, default: 0 },
        },
        accommodation: String,
        totalDayCost: { type: Number, default: 0 },
      },
    ],

    transportation: {
      type: {
        type: String,
        default: 'mixed',
      },
      details: String,
      cost: { type: Number, default: 0 },
    },

    budgetBreakdown: {
      transportation: { type: Number, default: 0 },
      accommodation: { type: Number, default: 0 },
      food: { type: Number, default: 0 },
      activities: { type: Number, default: 0 },
      other: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },

    tips: [String],
    warnings: [String],

    aiGenerated: {
      type: Boolean,
      default: true,
    },
    aiModel: {
      type: String,
      default: 'gemini-2.5-flash',
    },

    isPublic: {
      type: Boolean,
      default: false,
    },
    likes: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
TripPlanSchema.index({ userId: 1, createdAt: -1 });
TripPlanSchema.index({ isPublic: 1, likes: -1 });
TripPlanSchema.index({ destinations: 1 });

export default mongoose.models.TripPlan ||
  mongoose.model<ITripPlan>('TripPlan', TripPlanSchema);

