import mongoose, { Schema, Document } from 'mongoose';

export interface IEmployeeAttributeValue extends Document {
  _id: mongoose.Types.ObjectId; // Primary key
  employee_id: mongoose.Types.ObjectId; // Foreign key to EmployeeProfile
  attribute_id: mongoose.Types.ObjectId; // Foreign key to CustomAttributeDefinition
  value: string; // The actual value (e.g., "Sales", "Operations")
  created_at: Date;
  updated_at: Date;
}

const EmployeeAttributeValueSchema = new Schema<IEmployeeAttributeValue>({
  employee_id: {
    type: Schema.Types.ObjectId,
    ref: 'EmployeeProfile',
    required: true
  },
  attribute_id: {
    type: Schema.Types.ObjectId,
    ref: 'CustomAttributeDefinition',
    required: true
  },
  value: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  }
}, {
  timestamps: { 
    createdAt: 'created_at', 
    updatedAt: 'updated_at' 
  }
});

// Compound unique index to ensure one value per employee per attribute
EmployeeAttributeValueSchema.index(
  { employee_id: 1, attribute_id: 1 }, 
  { unique: true }
);

// Index for efficient queries
EmployeeAttributeValueSchema.index({ employee_id: 1 });
EmployeeAttributeValueSchema.index({ attribute_id: 1 });

// Pre-save middleware to validate business rules
EmployeeAttributeValueSchema.pre('save', async function(next) {
  try {
    // Check if both employee and attribute exist and are active
    const EmployeeProfile = mongoose.model('EmployeeProfile');
    const CustomAttributeDefinition = mongoose.model('CustomAttributeDefinition');
    
    const employee = await EmployeeProfile.findById(this.employee_id);
    if (!employee || !employee.isActive) {
      throw new Error('Employee not found or inactive');
    }
    
    const attribute = await CustomAttributeDefinition.findById(this.attribute_id);
    if (!attribute || !attribute.is_active) {
      throw new Error('Custom attribute definition not found or inactive');
    }
    
    next();
  } catch (error: any) {
    next(error);
  }
});

// Force model refresh to ensure new schema is used
const modelName = 'EmployeeAttributeValue';
if (mongoose.models[modelName]) {
  delete mongoose.models[modelName];
}

export default mongoose.model<IEmployeeAttributeValue>(modelName, EmployeeAttributeValueSchema);
