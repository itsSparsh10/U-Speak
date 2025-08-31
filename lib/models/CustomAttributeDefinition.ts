import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICustomAttributeDefinition extends Document {
  _id: mongoose.Types.ObjectId;
  account_id: mongoose.Types.ObjectId; // References CorporateAccount
  position: 1 | 2 | 3; // Only positions 1, 2, or 3 allowed
  name: string; // Display name for the attribute (e.g., "Division", "Region", "Level")
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ICustomAttributeDefinitionModel extends Model<ICustomAttributeDefinition> {
  getByAccount(accountId: mongoose.Types.ObjectId): Promise<ICustomAttributeDefinition[]>;
  createOrUpdate(accountId: mongoose.Types.ObjectId, position: number, name: string): Promise<ICustomAttributeDefinition>;
}

const CustomAttributeDefinitionSchema = new Schema<ICustomAttributeDefinition>({
  account_id: {
    type: Schema.Types.ObjectId,
    ref: 'CorporateAccount',
    required: true,
    index: true
  },
  position: {
    type: Number,
    required: true,
    enum: [1, 2, 3],
    validate: {
      validator: function(value: number) {
        return value >= 1 && value <= 3;
      },
      message: 'Position must be 1, 2, or 3'
    }
  },
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 50,
    validate: {
      validator: function(value: string) {
        return /^[a-zA-Z0-9\s\-_]+$/.test(value);
      },
      message: 'Name can only contain letters, numbers, spaces, hyphens, and underscores'
    }
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: { 
    createdAt: 'created_at', 
    updatedAt: 'updated_at' 
  }
});

// Compound unique index to ensure one attribute per position per account
CustomAttributeDefinitionSchema.index(
  { account_id: 1, position: 1 }, 
  { unique: true }
);

// Index for efficient queries
CustomAttributeDefinitionSchema.index({ account_id: 1, is_active: 1 });

// Pre-save middleware to enforce business rules
CustomAttributeDefinitionSchema.pre('save', async function(next) {
  try {
    // Check if this is a new document or position is being changed
    if (this.isNew || this.isModified('position')) {
      // Count existing active attributes for this account
      const existingCount = await mongoose.model('CustomAttributeDefinition').countDocuments({
        account_id: this.account_id,
        is_active: true,
        _id: { $ne: this._id } // Exclude current document from count
      });

      // If we're creating a new active attribute, ensure we don't exceed 3 total
      if (this.is_active && existingCount >= 3) {
        throw new Error('Maximum of 3 custom attributes allowed per account');
      }
    }

    next();
  } catch (error: any) {
    next(error);
  }
});

// Pre-validate middleware to ensure position uniqueness
CustomAttributeDefinitionSchema.pre('save', async function(next) {
  try {
    if (this.isNew || this.isModified('position')) {
      const existing = await mongoose.model('CustomAttributeDefinition').findOne({
        account_id: this.account_id,
        position: this.position,
        _id: { $ne: this._id }
      });

      if (existing) {
        throw new Error(`Position ${this.position} is already occupied for this account`);
      }
    }

    next();
  } catch (error: any) {
    next(error);
  }
});

// Static method to get all definitions for an account
CustomAttributeDefinitionSchema.statics.getByAccount = function(accountId: mongoose.Types.ObjectId) {
  return this.find({ 
    account_id: accountId, 
    is_active: true 
  }).sort({ position: 1 });
};

// Static method to safely create or update an attribute definition
CustomAttributeDefinitionSchema.statics.createOrUpdate = async function(
  accountId: mongoose.Types.ObjectId, 
  position: number, 
  name: string
) {
  try {
    const existing = await this.findOne({ account_id: accountId, position });
    
    if (existing) {
      existing.name = name;
      existing.is_active = true;
      return await existing.save();
    } else {
      return await this.create({
        account_id: accountId,
        position,
        name,
        is_active: true
      });
    }
  } catch (error: any) {
    throw new Error(`Failed to create/update custom attribute: ${error.message}`);
  }
};

// Force model refresh to ensure new schema is used
const modelName = 'CustomAttributeDefinition';
if (mongoose.models[modelName]) {
  delete mongoose.models[modelName];
}

export default mongoose.model<ICustomAttributeDefinition, ICustomAttributeDefinitionModel>(modelName, CustomAttributeDefinitionSchema);
