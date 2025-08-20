const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const Employee = require('../lib/models/Employee').default;
const User = require('../lib/models/User').default;
const CorporateAccount = require('../lib/models/CorporateAccount').default;

async function connectDB() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/uspeak';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

function generateTempPassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

async function migrateEmployeesToUsers() {
  try {
    console.log('🔄 Starting employee migration to users...');
    
    // Find all active employees
    const employees = await Employee.find({ isActive: true });
    console.log(`📊 Found ${employees.length} active employees`);
    
    let createdUsers = 0;
    let skippedUsers = 0;
    let errors = 0;
    
    for (const employee of employees) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: employee.email });
        if (existingUser) {
          console.log(`⏭️  User already exists for ${employee.email}, skipping...`);
          skippedUsers++;
          continue;
        }
        
        // Generate temporary password
        const tempPassword = generateTempPassword();
        
        // Create user record
        const newUser = await User.create({
          email: employee.email,
          password: tempPassword, // Will be hashed by pre-save hook
          role: 'CORPORATE_USER',
          status: 'ACTIVE',
          corporateAccountId: employee.corporateAccountId,
          firstName: employee.firstName,
          lastName: employee.lastName
        });
        
        console.log(`✅ Created user for employee: ${employee.email} (${employee.firstName} ${employee.lastName})`);
        console.log(`   📧 Email: ${employee.email}`);
        console.log(`   🔑 Temp Password: ${tempPassword}`);
        console.log(`   🆔 User ID: ${newUser._id}`);
        console.log('   ──────────────────────────────────────────────');
        
        createdUsers++;
        
      } catch (error) {
        console.error(`❌ Error creating user for ${employee.email}:`, error.message);
        errors++;
      }
    }
    
    console.log('\n📈 Migration Summary:');
    console.log(`   ✅ Users Created: ${createdUsers}`);
    console.log(`   ⏭️  Users Skipped: ${skippedUsers}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   📊 Total Processed: ${employees.length}`);
    
    if (createdUsers > 0) {
      console.log('\n⚠️  IMPORTANT: Share the temporary passwords with employees!');
      console.log('   They will need these passwords to log in for the first time.');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

async function main() {
  try {
    await connectDB();
    await migrateEmployeesToUsers();
  } catch (error) {
    console.error('❌ Main execution failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the migration
if (require.main === module) {
  main();
}

module.exports = { migrateEmployeesToUsers };
