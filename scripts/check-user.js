const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../lib/models/User').default;
const Employee = require('../lib/models/Employee').default;

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

async function checkUser() {
  try {
    console.log('🔍 Checking user: demoo@gmail.com');
    
    // Check User collection
    const user = await User.findOne({ email: 'demoo@gmail.com' });
    if (user) {
      console.log('✅ Found in User collection:');
      console.log(`   🆔 ID: ${user._id}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   👤 Role: ${user.role}`);
      console.log(`   📊 Status: ${user.status}`);
      console.log(`   🏢 Corporate Account ID: ${user.corporateAccountId}`);
      console.log(`   📝 First Name: ${user.firstName}`);
      console.log(`   📝 Last Name: ${user.lastName}`);
    } else {
      console.log('❌ Not found in User collection');
    }
    
    // Check Employee collection
    const employee = await Employee.findOne({ email: 'demoo@gmail.com' });
    if (employee) {
      console.log('\n✅ Found in Employee collection:');
      console.log(`   🆔 ID: ${employee._id}`);
      console.log(`   📧 Email: ${employee.email}`);
      console.log(`   🏢 Corporate Account ID: ${employee.corporateAccountId}`);
      console.log(`   📝 First Name: ${employee.firstName}`);
      console.log(`   📝 Last Name: ${employee.lastName}`);
      console.log(`   🏢 Department: ${employee.department}`);
      console.log(`   💼 Job Title: ${employee.jobTitle}`);
      console.log(`   📊 Is Active: ${employee.isActive}`);
    } else {
      console.log('\n❌ Not found in Employee collection');
    }
    
  } catch (error) {
    console.error('❌ Error checking user:', error);
  }
}

async function main() {
  try {
    await connectDB();
    await checkUser();
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

module.exports = { checkUser };
