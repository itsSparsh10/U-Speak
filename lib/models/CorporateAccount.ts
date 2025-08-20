import mongoose, { Schema, Document } from 'mongoose';

export interface ICorporateAccount extends Document {
  _id: mongoose.Types.ObjectId;
  companyName: string;
  subscriptionPlan: string;
  customAttributes: {
    attribute1: { name: string; values: string[] };
    attribute2: { name: string; values: string[] };
    attribute3: { name: string; values: string[] };
  };
  status: 'active' | 'suspended' | 'cancelled';
  maxEmployees: number;
  createdAt: Date;
  updatedAt: Date;
}

const CorporateAccountSchema = new Schema<ICorporateAccount>({
  companyName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 100
  },
  subscriptionPlan: {
    type: String,
    required: true,
    enum: ['basic', 'professional', 'enterprise'],
    default: 'basic'
  },
  customAttributes: {
    attribute1: {
      name: { type: String, default: 'Division' },
      values: [{ type: String }]
    },
    attribute2: {
      name: { type: String, default: 'Function' },
      values: [{ type: String }]
    },
    attribute3: {
      name: { type: String, default: 'Role' },
      values: [{ type: String }]
    }
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'cancelled'],
    default: 'active'
  },
  maxEmployees: {
    type: Number,
    required: true,
    min: 1,
    max: 50000,
    default: 100
  }
}, {
  timestamps: true
});

// Index for efficient queries
CorporateAccountSchema.index({ companyName: 1 });
CorporateAccountSchema.index({ status: 1 });

export default mongoose.models.CorporateAccount || mongoose.model<ICorporateAccount>('CorporateAccount', CorporateAccountSchema);
