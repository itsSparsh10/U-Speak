import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  performedByUserId: mongoose.Types.ObjectId;
  corporateAccountId: mongoose.Types.ObjectId;
  actionType: string;
  targetUserId?: mongoose.Types.ObjectId;
  targetEmployeeId?: mongoose.Types.ObjectId;
  targetLicenseId?: mongoose.Types.ObjectId;
  details: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
  performedByUserId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  corporateAccountId: {
    type: Schema.Types.ObjectId,
    ref: 'CorporateAccount',
    required: true
  },
  actionType: {
    type: String,
    required: true,
    enum: [
      'LOGIN',
      'ADMIN_LOGIN',
      'USER_LOGIN',
      'EMPLOYEE_LOGIN',
      'ADMIN_LOGIN_AS_EMPLOYEE',
      'ADMIN_LOGOUT_FROM_EMPLOYEE',
      'LOGOUT',
      'ADMIN_LOGOUT',
      'USER_LOGOUT',
      'EMPLOYEE_LOGOUT',
      'ADD_EMPLOYEE',
      'EDIT_EMPLOYEE',
      'DEACTIVATE_EMPLOYEE',
      'DELETE_EMPLOYEE',
      'BULK_UPLOAD',
      'ASSIGN_LICENSE',
      'REVOKE_LICENSE',
      'UPDATE_CUSTOM_ATTRIBUTES',
      'VIEW_REPORT',
      'EXPORT_REPORT',
      'CREATE_CORPORATE_ACCOUNT',
      'UPDATE_CORPORATE_ACCOUNT',
      'PASSWORD_RESET',
      'ACCOUNT_SUSPENSION'
    ]
  },
  targetUserId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  targetEmployeeId: {
    type: Schema.Types.ObjectId,
    ref: 'Employee'
  },
  targetLicenseId: {
    type: Schema.Types.ObjectId,
    ref: 'License'
  },
  details: {
    type: String,
    required: true,
    maxlength: 1000
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true,
    maxlength: 500
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient queries and compliance
AuditLogSchema.index({ corporateAccountId: 1, timestamp: -1 });
AuditLogSchema.index({ performedByUserId: 1, timestamp: -1 });
AuditLogSchema.index({ actionType: 1, timestamp: -1 });
AuditLogSchema.index({ timestamp: -1 });

// Force model refresh to ensure new enum values are available
const modelName = 'AuditLog';
if (mongoose.models[modelName]) {
  delete mongoose.models[modelName];
}

export default mongoose.model<IAuditLog>(modelName, AuditLogSchema);
