const mongoose = require('mongoose');
require('dotenv').config();

async function testDatabase() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/uspeak-pro';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB successfully');

    // Check what collections exist
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📚 Collections in database:');
    collections.forEach(col => console.log(`  - ${col.name}`));

    // Check if we have any users
    const User = mongoose.model('User', new mongoose.Schema({}));
    const userCount = await User.countDocuments();
    console.log(`\n👥 Total users in database: ${userCount}`);

    if (userCount > 0) {
      const users = await User.find().limit(5);
      console.log('\n📋 Sample users:');
      users.forEach(user => {
        console.log(`  - ${user.email} (${user.role}) - ${user.firstName} ${user.lastName}`);
      });
    }

    // Check if we have any employee profiles
    const EmployeeProfile = mongoose.model('EmployeeProfile', new mongoose.Schema({}));
    const profileCount = await EmployeeProfile.countDocuments();
    console.log(`\n👤 Total employee profiles: ${profileCount}`);

    // Check if we have any employees in the new collection
    const Employee = mongoose.model('Employee', new mongoose.Schema({}));
    const employeeCount = await Employee.countDocuments();
    console.log(`\n👷 Total employees (new collection): ${employeeCount}`);

    if (employeeCount > 0) {
      const employees = await Employee.find().limit(3);
      console.log('\n📋 Sample employees:');
      employees.forEach(emp => {
        console.log(`  - ${emp.firstName} ${emp.lastName} (${emp.email}) - ${emp.department}`);
      });
    }

    // Check if we have any licenses
    const License = mongoose.model('License', new mongoose.Schema({}));
    const licenseCount = await License.countDocuments();
    console.log(`\n🔑 Total licenses: ${licenseCount}`);

  } catch (error) {
    console.error('❌ Error testing database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testDatabase();
