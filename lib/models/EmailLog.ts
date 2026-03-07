/**
 * EmailLog Model
 * Track all emails sent through the system
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEmailLog extends Document {
  userId?: mongoose.Types.ObjectId;
  type: 'transactional' | 'notification' | 'marketing';
  template: string;
  recipient: string;
  subject: string;
  status: 'sent' | 'delivered' | 'bounced' | 'failed';
  resendId?: string;
  metadata?: Record<string, any>;
  sentAt: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EmailLogSchema = new Schema<IEmailLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    type: {
      type: String,
      enum: ['transactional', 'notification', 'marketing'],
      required: true,
      index: true,
    },
    template: {
      type: String,
      required: true,
      index: true,
    },
    recipient: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    subject: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'bounced', 'failed'],
      default: 'sent',
      index: true,
    },
    resendId: {
      type: String,
      sparse: true,
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    sentAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    deliveredAt: Date,
    openedAt: Date,
    clickedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
EmailLogSchema.index({ userId: 1, sentAt: -1 });
EmailLogSchema.index({ type: 1, status: 1, sentAt: -1 });
EmailLogSchema.index({ template: 1, sentAt: -1 });

// Prevent duplicate model compilation
const EmailLog: Model<IEmailLog> = 
  mongoose.models.EmailLog || 
  mongoose.model<IEmailLog>('EmailLog', EmailLogSchema);

export default EmailLog;

