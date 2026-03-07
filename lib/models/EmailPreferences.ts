/**
 * EmailPreferences Model
 * User email notification preferences
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEmailPreferences extends Document {
  userId: mongoose.Types.ObjectId;
  transactional: boolean; // Always true (welcome, password reset)
  notifications: {
    reviews: boolean;
    followers: boolean;
    badges: boolean;
    replies: boolean;
  };
  marketing: boolean;
  frequency: 'instant' | 'daily' | 'weekly' | 'never';
  unsubscribedAt?: Date;
  unsubscribeToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EmailPreferencesSchema = new Schema<IEmailPreferences>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    transactional: {
      type: Boolean,
      default: true, // Always enabled
    },
    notifications: {
      reviews: {
        type: Boolean,
        default: true,
      },
      followers: {
        type: Boolean,
        default: true,
      },
      badges: {
        type: Boolean,
        default: true,
      },
      replies: {
        type: Boolean,
        default: true,
      },
    },
    marketing: {
      type: Boolean,
      default: true,
    },
    frequency: {
      type: String,
      enum: ['instant', 'daily', 'weekly', 'never'],
      default: 'instant',
    },
    unsubscribedAt: Date,
    unsubscribeToken: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

// Methods
EmailPreferencesSchema.methods.canReceiveEmail = function(
  type: 'transactional' | 'notification' | 'marketing'
): boolean {
  // User unsubscribed from all
  if (this.unsubscribedAt) {
    return type === 'transactional'; // Only transactional allowed
  }

  // Check by type
  if (type === 'transactional') return this.transactional;
  if (type === 'notification') return this.frequency !== 'never';
  if (type === 'marketing') return this.marketing;

  return false;
};

// Prevent duplicate model compilation
const EmailPreferences: Model<IEmailPreferences> = 
  mongoose.models.EmailPreferences || 
  mongoose.model<IEmailPreferences>('EmailPreferences', EmailPreferencesSchema);

export default EmailPreferences;

