const mongoose = require('mongoose');
require('dotenv').config();

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

async function fixEmployeeUsers() {
  try {
    console.log('🔄 Fixing employee user records...');
    
    // Use mongoose models directly
    const User = mongoose.model('User', new mongoose.Schema({}));
    const Employee = mongoose.model('Employee', new mongoose.Schema({}));
    
    // Find all active employees
    const employees = await Employee.find({ isActive: true });
    console.log(`📊 Found ${employees.length} active employees`);
    
    let fixedUsers = 0;
    let createdUsers = 0;
    let errors = 0;
    
    for (const employee of employees) {
      try {
        console.log(`\n🔍 Processing employee: ${employee.email}`);
        
        // Check if user already exists
        let existingUser = await User.findOne({ email: employee.email });
        
        if (existingUser) {
          // User exists, check if corporateAccountId matches
          if (existingUser.corporateAccountId && 
              existingUser.corporateAccountId.toString() === employee.corporateAccountId.toString()) {
            console.log(`✅ User already exists with correct corporateAccountId`);
            fixedUsers++;
            continue;
          } else {
            // Update existing user with correct corporateAccountId
            existingUser.corporateAccountId = employee.corporateAccountId;
            await existingUser.save();
            console.log(`🔧 Updated existing user with correct corporateAccountId`);
            fixedUsers++;
            continue;
          }
        }
        
        // User doesn't exist, create new one
        const tempPassword = generateTempPassword();
        
        const newUser = await User.create({
          email: employee.email,
          password: tempPassword,
          role: 'CORPORATE_USER',
          status: 'ACTIVE',
          corporateAccountId: employee.corporateAccountId,
          firstName: employee.firstName,
          lastName: employee.lastName
        });
        
        console.log(`✅ Created new user for employee: ${employee.email}`);
        console.log(`   🔑 Temporary Password: ${tempPassword}`);
        console.log(`   🆔 User ID: ${newUser._id}`);
        console.log(`   🏢 Corporate Account ID: ${newUser.corporateAccountId}`);
        
        createdUsers++;
        
      } catch (error) {
        console.error(`❌ Error processing ${employee.email}:`, error.message);
        errors++;
      }
    }
    
    console.log('\n📈 Fix Summary:');
    console.log(`   ✅ Users Fixed: ${fixedUsers}`);
    console.log(`   🆕 Users Created: ${createdUsers}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   📊 Total Processed: ${employees.length}`);
    
    if (createdUsers > 0) {
      console.log('\n⚠️  IMPORTANT: Share the temporary passwords with employees!');
      console.log('   They will need these passwords to log in for the first time.');
    }
    
  } catch (error) {
    console.error('❌ Fix failed:', error);
  }
}

async function main() {
  try {
    await connectDB();
    await fixEmployeeUsers();
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

module.exports = { fixEmployeeUsers };
