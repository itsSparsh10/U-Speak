import mongoose, { Schema, Document } from 'mongoose';

export interface IEmployee extends Document {
  _id: mongoose.Types.ObjectId;
  corporateAccountId: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  department: string;
  jobTitle: string;
  customAttributes: {
    attribute1Value?: string;
    attribute2Value?: string;
    attribute3Value?: string;
  };
  employeeId: string; // Company's internal employee ID
  hireDate: Date;
  managerId?: mongoose.Types.ObjectId;
  isActive: boolean;
  licenseId?: mongoose.Types.ObjectId;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeSchema = new Schema<IEmployee>({
  corporateAccountId: {
    type: Schema.Types.ObjectId,
    ref: 'CorporateAccount',
    required: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phoneNumber: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
  },
  department: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  jobTitle: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  customAttributes: {
    attribute1Value: {
      type: String,
      trim: true,
      maxlength: 100
    },
    attribute2Value: {
      type: String,
      trim: true,
      maxlength: 100
    },
    attribute3Value: {
      type: String,
      trim: true,
      maxlength: 100
    }
  },
  employeeId: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  hireDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  managerId: {
    type: Schema.Types.ObjectId,
    ref: 'Employee'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  licenseId: {
    type: Schema.Types.ObjectId,
    ref: 'License'
  },
  lastLoginAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
EmployeeSchema.index({ corporateAccountId: 1, isActive: 1 });
EmployeeSchema.index({ corporateAccountId: 1, department: 1 });
EmployeeSchema.index({ corporateAccountId: 1, 'customAttributes.attribute1Value': 1 });
EmployeeSchema.index({ corporateAccountId: 1, 'customAttributes.attribute2Value': 1 });
EmployeeSchema.index({ corporateAccountId: 1, 'customAttributes.attribute3Value': 1 });
EmployeeSchema.index({ email: 1 });

export default mongoose.models.Employee || mongoose.model<IEmployee>('Employee', EmployeeSchema);
