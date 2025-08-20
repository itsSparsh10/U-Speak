import mongoose, { Schema, Document } from 'mongoose';

export interface ILicense extends Document {
  licenseType: 'USPEAK_PRO' | 'USPEAK_BASIC' | 'USPEAK_ENTERPRISE';
  status: 'ASSIGNED' | 'AVAILABLE' | 'EXPIRED' | 'REVOKED';
  corporateAccountId: mongoose.Types.ObjectId;
  assignedToEmployeeId?: mongoose.Types.ObjectId;
  assignedAt?: Date;
  expiresAt?: Date;
  licenseKey: string;
  features: string[];
  maxUsers?: number;
  createdAt: Date;
  updatedAt: Date;
}

const LicenseSchema = new Schema<ILicense>({
  licenseType: {
    type: String,
    required: true,
    enum: ['USPEAK_PRO', 'USPEAK_BASIC', 'USPEAK_ENTERPRISE'],
    default: 'USPEAK_PRO'
  },
  status: {
    type: String,
    required: true,
    enum: ['ASSIGNED', 'AVAILABLE', 'EXPIRED', 'REVOKED'],
    default: 'AVAILABLE'
  },
  corporateAccountId: {
    type: Schema.Types.ObjectId,
    ref: 'CorporateAccount',
    required: true
  },
  assignedToEmployeeId: {
    type: Schema.Types.ObjectId,
    ref: 'Employee'
  },
  assignedAt: {
    type: Date
  },
  expiresAt: {
    type: Date
  },
  licenseKey: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  features: [{
    type: String,
    enum: [
      'VIDEO_ANALYSIS',
      'LEARNING_LESSONS',
      'PROGRESS_TRACKING',
      'ADVANCED_REPORTING',
      'BULK_UPLOAD',
      'CUSTOM_ATTRIBUTES',
      'API_ACCESS'
    ]
  }],
  maxUsers: {
    type: Number,
    min: 1,
    default: 1
  }
}, {
  timestamps: true
});

// Generate license key before saving
LicenseSchema.pre('save', function(next) {
  if (!this.licenseKey) {
    this.licenseKey = 'USP-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }
  next();
});

// Indexes for efficient queries
LicenseSchema.index({ corporateAccountId: 1 });
LicenseSchema.index({ status: 1 });
LicenseSchema.index({ assignedToEmployeeId: 1 });
LicenseSchema.index({ licenseKey: 1 });
LicenseSchema.index({ expiresAt: 1 });

export default mongoose.models.License || mongoose.model<ILicense>('License', LicenseSchema);
