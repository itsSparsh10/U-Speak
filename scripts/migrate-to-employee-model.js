const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../lib/models/User').default;
const EmployeeProfile = require('../lib/models/EmployeeProfile').default;
const Employee = require('../lib/models/Employee').default;
const License = require('../lib/models/License').default;

async function migrateToEmployeeModel() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/uspeak-pro';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB successfully');

    console.log('\n🔄 Starting migration to new Employee model...');

    // Find all users with role 'EMPLOYEE'
    const employeeUsers = await User.find({ role: 'EMPLOYEE' });
    console.log(`Found ${employeeUsers.length} employee users to migrate`);

    // Find all employee profiles
    const employeeProfiles = await EmployeeProfile.find({});
    console.log(`Found ${employeeProfiles.length} employee profiles`);

    // Create a map for quick lookup
    const profileMap = new Map();
    employeeProfiles.forEach(profile => {
      profileMap.set(profile.userId.toString(), profile);
    });

    let migratedCount = 0;
    let skippedCount = 0;

    for (const user of employeeUsers) {
      try {
        const profile = profileMap.get(user._id.toString());
        
        if (!profile) {
          console.log(`⚠️  No profile found for user ${user.email}, skipping...`);
          skippedCount++;
          continue;
        }

        // Check if employee already exists
        const existingEmployee = await Employee.findOne({ email: user.email });
        if (existingEmployee) {
          console.log(`⚠️  Employee ${user.email} already exists, skipping...`);
          skippedCount++;
          continue;
        }

        // Create new employee record
        const newEmployee = await Employee.create({
          corporateAccountId: user.corporateAccountId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: profile.phoneNumber,
          department: profile.department,
          jobTitle: profile.jobTitle,
          customAttributes: profile.customAttributes,
          employeeId: profile.employeeId,
          hireDate: profile.hireDate,
          isActive: profile.isActive,
          lastLoginAt: user.lastLoginAt
        });

        console.log(`✅ Migrated: ${user.firstName} ${user.lastName} (${user.email})`);
        migratedCount++;

        // Update license to reference new employee
        await License.updateMany(
          { assignedToEmployeeId: user._id },
          { 
            assignedToEmployeeId: newEmployee._id,
            assignedAt: new Date()
          }
        );

      } catch (error) {
        console.error(`❌ Error migrating user ${user.email}:`, error.message);
      }
    }

    console.log('\n🎉 Migration completed!');
    console.log(`✅ Successfully migrated: ${migratedCount} employees`);
    console.log(`⚠️  Skipped: ${skippedCount} employees`);
    console.log(`📊 Total processed: ${employeeUsers.length} users`);

    // Show new employee count
    const newEmployeeCount = await Employee.countDocuments();
    console.log(`\n📈 New Employee collection now contains: ${newEmployeeCount} employees`);

    console.log('\n💡 Next steps:');
    console.log('1. Test the new API endpoints');
    console.log('2. Verify employee data is correct');
    console.log('3. Consider removing old User records with role "EMPLOYEE"');
    console.log('4. Consider removing old EmployeeProfile records');

  } catch (error) {
    console.error('❌ Error during migration:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the migration
migrateToEmployeeModel();
