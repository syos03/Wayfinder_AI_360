import mongoose, { Document, Schema } from 'mongoose';

export interface IUserPreferences extends Document {
  userId: mongoose.Types.ObjectId;
  preferredRegions: string[];
  preferredTypes: string[];
  budgetRange: {
    min: number;
    max: number;
  };
  travelStyle: 'budget' | 'comfort' | 'luxury';
  interests: string[];
  updatedAt: Date;
}

const UserPreferencesSchema = new Schema<IUserPreferences>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    preferredRegions: {
      type: [String],
      default: [],
      enum: ['Bắc Bộ', 'Trung Bộ', 'Nam Bộ'],
    },
    preferredTypes: {
      type: [String],
      default: [],
      enum: ['Biển', 'Núi', 'Thành phố', 'Văn hóa', 'Thiên nhiên', 'Lịch sử', 'Ẩm thực', 'Nghỉ dưỡng'],
    },
    budgetRange: {
      min: {
        type: Number,
        default: 0,
      },
      max: {
        type: Number,
        default: 10000000,
      },
    },
    travelStyle: {
      type: String,
      enum: ['budget', 'comfort', 'luxury'],
      default: 'comfort',
    },
    interests: {
      type: [String],
      default: [],
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Note: userId already has unique index from schema definition (unique: true)
// No need to add explicit index

export default mongoose.models.UserPreferences ||
  mongoose.model<IUserPreferences>('UserPreferences', UserPreferencesSchema);

