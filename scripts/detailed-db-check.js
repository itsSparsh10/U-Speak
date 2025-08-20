const mongoose = require('mongoose');
require('dotenv').config();

async function detailedDatabaseCheck() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/uspeak-pro';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB successfully\n');

    // Check Users collection (should only contain corporate customers, not employees)
    const User = mongoose.model('User', new mongoose.Schema({}));
    const users = await User.find({});
    console.log('👥 USERS Collection (Corporate Customers):');
    console.log(`Total users: ${users.length}`);
    users.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.email} - Role: ${user.role || 'N/A'} - Name: ${user.firstName || 'N/A'} ${user.lastName || 'N/A'}`);
    });
    console.log('');

    // Check Employees collection (new structure - individual employees)
    const Employee = mongoose.model('Employee', new mongoose.Schema({}));
    const employees = await Employee.find({});
    console.log('👷 EMPLOYEES Collection (Individual Team Members):');
    console.log(`Total employees: ${employees.length}`);
    employees.forEach((emp, index) => {
      console.log(`  ${index + 1}. ${emp.firstName} ${emp.lastName} - ${emp.email} - ${emp.department} - ${emp.jobTitle}`);
      console.log(`     Employee ID: ${emp.employeeId} - Phone: ${emp.phoneNumber || 'N/A'}`);
      console.log(`     Custom Attributes: ${emp.customAttributes?.attribute1Value || 'N/A'}, ${emp.customAttributes?.attribute2Value || 'N/A'}, ${emp.customAttributes?.attribute3Value || 'N/A'}`);
      console.log(`     License ID: ${emp.licenseId || 'N/A'}`);
      console.log('');
    });

    // Check Licenses collection
    const License = mongoose.model('License', new mongoose.Schema({}));
    const licenses = await License.find({});
    console.log('🔑 LICENSES Collection:');
    console.log(`Total licenses: ${licenses.length}`);
    licenses.forEach((license, index) => {
      console.log(`  ${index + 1}. Type: ${license.licenseType} - Status: ${license.status} - Key: ${license.licenseKey}`);
      console.log(`     Corporate Account: ${license.corporateAccountId} - Assigned To: ${license.assignedToEmployeeId || 'Unassigned'}`);
      console.log('');
    });

    // Check EmployeeProfiles collection (legacy - should be empty or old data)
    const EmployeeProfile = mongoose.model('EmployeeProfile', new mongoose.Schema({}));
    const profiles = await EmployeeProfile.find({});
    console.log('📋 EMPLOYEE PROFILES Collection (Legacy - Old Structure):');
    console.log(`Total profiles: ${profiles.length}`);
    if (profiles.length > 0) {
      console.log('⚠️  This collection contains old data and is no longer used for new employees');
      profiles.forEach((profile, index) => {
        console.log(`  ${index + 1}. User ID: ${profile.userId} - Department: ${profile.department} - Job Title: ${profile.jobTitle}`);
      });
    } else {
      console.log('✅ This collection is empty (good - no legacy data)');
    }
    console.log('');

    // Summary
    console.log('📊 SUMMARY:');
    console.log(`✅ Corporate Customers (Users): ${users.length}`);
    console.log(`✅ Individual Employees: ${employees.length}`);
    console.log(`✅ Active Licenses: ${licenses.length}`);
    console.log(`⚠️  Legacy Employee Profiles: ${profiles.length}`);
    console.log('');
    
    if (employees.length > 0 && users.filter(u => u.role === 'EMPLOYEE').length === 0) {
      console.log('🎉 SUCCESS: New structure is working correctly!');
      console.log('   - Employees are stored in the employees collection');
      console.log('   - No new employee users are created in users collection');
      console.log('   - Data separation is working as intended');
    } else {
      console.log('⚠️  WARNING: Some issues detected with data structure');
    }

  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

detailedDatabaseCheck();
