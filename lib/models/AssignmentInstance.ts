import mongoose, { Schema, Document } from 'mongoose';

export interface IAssignmentInstance extends Document {
  _id: mongoose.Types.ObjectId;
  instance_id: mongoose.Types.ObjectId;
  assignment_id: mongoose.Types.ObjectId;
  account_id: mongoose.Types.ObjectId;
  assigned_by_user_id: mongoose.Types.ObjectId;
  assigned_to_employee_id?: mongoose.Types.ObjectId; // Direct reference to assigned employee
  assigned_to_employee_name?: string; // Employee's display name for quick access
  deadline?: Date;
  assignment_scope: 'INDIVIDUAL' | 'BULK';
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  instructions?: string;
  links?: string[]; // new: optional array of validated links
  created_at: Date;
  updated_at: Date;
}

const AssignmentInstanceSchema = new Schema<IAssignmentInstance>({
  assignment_id: {
    type: Schema.Types.ObjectId,
    ref: 'AssignmentMaster',
    required: true
  },
  account_id: {
    type: Schema.Types.ObjectId,
    ref: 'CorporateAccount',
    required: true
  },
  assigned_by_user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assigned_to_employee_id: {
    type: Schema.Types.ObjectId,
    ref: 'EmployeeProfile',
    required: false
  },
  assigned_to_employee_name: {
    type: String,
    required: false,
    trim: true,
    maxlength: 200
  },
  deadline: {
    type: Date
  },
  assignment_scope: {
    type: String,
    required: true,
    enum: ['INDIVIDUAL', 'BULK'],
    default: 'INDIVIDUAL'
  },
  status: {
    type: String,
    required: true,
    enum: ['ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'],
    default: 'ACTIVE'
  },
  instructions: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  // New links field: array of strings validated to start with http/https
  links: {
    type: [String],
    validate: {
      validator: function(arr: any[]) {
        if (!arr) return true;
        if (!Array.isArray(arr)) return false;
        // Limit to max 20 links per instance
        if (arr.length > 20) return false;
        // Each link must be a trimmed http/https string and not exceed 2048 chars
        return arr.every(link => {
          if (typeof link !== 'string') return false;
          const s = link.trim();
          if (!/^https?:\/\//i.test(s)) return false;
          if (s.length > 2048) return false;
          return true;
        });
      },
      message: 'Links must be an array of http/https URLs (max 20).'
    }
  }
}, {
  timestamps: { 
    createdAt: 'created_at', 
    updatedAt: 'updated_at' 
  }
});

// Set instance_id to _id before saving
AssignmentInstanceSchema.pre('save', function(next) {
  this.instance_id = this._id;
  next();
});

// Virtual field to populate assigned employees
AssignmentInstanceSchema.virtual('assigned_employees', {
  ref: 'AssignmentEmployee',
  localField: '_id',
  foreignField: 'instance_id'
});

// Virtual field to populate just employee profiles directly
AssignmentInstanceSchema.virtual('employee_profiles', {
  ref: 'EmployeeProfile',
  localField: '_id',
  foreignField: '_id',
  match: function() {
    // This will be populated through aggregation pipeline
    return {};
  }
});

// Ensure virtual fields are included in JSON output
AssignmentInstanceSchema.set('toJSON', { virtuals: true });
AssignmentInstanceSchema.set('toObject', { virtuals: true });

// Indexes for efficient queries
AssignmentInstanceSchema.index({ account_id: 1, status: 1 });
AssignmentInstanceSchema.index({ assignment_id: 1 });
AssignmentInstanceSchema.index({ assigned_by_user_id: 1 });
AssignmentInstanceSchema.index({ deadline: 1 });
AssignmentInstanceSchema.index({ assignment_scope: 1 });

// Force model refresh to ensure new schema is used
const modelName = 'AssignmentInstance';
if (mongoose.models[modelName]) {
  delete mongoose.models[modelName];
}

export default mongoose.model<IAssignmentInstance>(modelName, AssignmentInstanceSchema);
