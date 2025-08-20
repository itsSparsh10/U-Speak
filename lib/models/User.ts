import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  role: 'CORPORATE_ADMIN' | 'CORPORATE_USER' | 'USER';
  status: 'ACTIVE' | 'DEACTIVATED' | 'DELETED';
  corporateAccountId: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  lastLoginAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  role: {
    type: String,
    required: true,
    enum: ['CORPORATE_ADMIN', 'CORPORATE_USER', 'USER'],
    default: 'CORPORATE_USER'
  },
  status: {
    type: String,
    required: true,
    enum: ['ACTIVE', 'DEACTIVATED', 'DELETED'],
    default: 'ACTIVE'
  },
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
  lastLoginAt: {
    type: Date
  },
  passwordResetToken: {
    type: String
  },
  passwordResetExpires: {
    type: Date
  }
}, {
  timestamps: true
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Indexes for efficient queries
UserSchema.index({ email: 1 });
UserSchema.index({ corporateAccountId: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ status: 1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
