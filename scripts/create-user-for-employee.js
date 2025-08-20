const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Employee = require('../lib/models/Employee').default;
const User = require('../lib/models/User').default;

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

async function createUserForEmployee() {
  try {
    console.log('🔄 Creating user record for employee: uspeek@gmail.com');
    
    // Find the specific employee
    const employee = await Employee.findOne({ email: 'uspeek@gmail.com' });
    if (!employee) {
      console.log('❌ Employee not found with email: uspeek@gmail.com');
      return;
    }
    
    console.log(`✅ Found employee: ${employee.firstName} ${employee.lastName}`);
    console.log(`   📧 Email: ${employee.email}`);
    console.log(`   🏢 Department: ${employee.department}`);
    console.log(`   💼 Job Title: ${employee.jobTitle}`);
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: employee.email });
    if (existingUser) {
      console.log('⏭️  User already exists for this employee, skipping...');
      console.log(`   🆔 User ID: ${existingUser._id}`);
      return;
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
    
    console.log('\n✅ Successfully created user record!');
    console.log(`   🆔 User ID: ${newUser._id}`);
    console.log(`   📧 Email: ${employee.email}`);
    console.log(`   🔑 Temporary Password: ${tempPassword}`);
    console.log(`   👤 Role: ${newUser.role}`);
    console.log(`   📊 Status: ${newUser.status}`);
    
    console.log('\n⚠️  IMPORTANT: Share this temporary password with the employee!');
    console.log('   They can now log in using:');
    console.log(`   📧 Email: ${employee.email}`);
    console.log(`   🔑 Password: ${tempPassword}`);
    
  } catch (error) {
    console.error('❌ Error creating user:', error);
  }
}

async function main() {
  try {
    await connectDB();
    await createUserForEmployee();
  } catch (error) {
    console.error('❌ Main execution failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { createUserForEmployee };
