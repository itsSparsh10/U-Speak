import mongoose, { Schema, Document } from 'mongoose';

export interface ILessonActivity extends Document {
  _id: mongoose.Types.ObjectId;
  activity_id: mongoose.Types.ObjectId;
  account_id: mongoose.Types.ObjectId;
  employee_id: mongoose.Types.ObjectId;
  assignment_employee_id?: mongoose.Types.ObjectId;
  lesson_id: string;
  time_spent_minutes: number;
  score?: number;
  attempted_at: Date;
  created_at: Date;
}

const LessonActivitySchema = new Schema<ILessonActivity>({
  account_id: {
    type: Schema.Types.ObjectId,
    ref: 'CorporateAccount',
    required: true,
    index: true
  },
  employee_id: {
    type: Schema.Types.ObjectId,
    ref: 'EmployeeProfile',
    required: true,
    index: true
  },
  assignment_employee_id: {
    type: Schema.Types.ObjectId,
    ref: 'AssignmentEmployee',
    default: null
  },
  lesson_id: {
    type: String,
    required: true,
    trim: true,
    maxlength: 128
  },
  time_spent_minutes: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
    validate: {
      validator: function(value: number) {
        return value >= 0;
      },
      message: 'Time spent must be non-negative'
    }
  },
  score: {
    type: Number,
    default: null,
    min: 0,
    max: 100,
    validate: {
      validator: function(value: number | null) {
        if (value === null || value === undefined) return true;
        return value >= 0 && value <= 100;
      },
      message: 'Score must be between 0 and 100'
    }
  },
  attempted_at: {
    type: Date,
    required: true,
    default: Date.now
  }
}, {
  timestamps: { 
    createdAt: 'created_at', 
    updatedAt: false 
  }
});

// Set activity_id to _id before saving
LessonActivitySchema.pre('save', function(next) {
  this.activity_id = this._id;
  next();
});

// Indexes for efficient queries
LessonActivitySchema.index({ employee_id: 1, attempted_at: -1 });
LessonActivitySchema.index({ account_id: 1, attempted_at: -1 });
LessonActivitySchema.index({ assignment_employee_id: 1 });
LessonActivitySchema.index({ lesson_id: 1 });
LessonActivitySchema.index({ account_id: 1, employee_id: 1, attempted_at: -1 });

// Force model refresh to ensure new schema is used
const modelName = 'LessonActivity';
if (mongoose.models[modelName]) {
  delete mongoose.models[modelName];
}

export default mongoose.model<ILessonActivity>(modelName, LessonActivitySchema);
