require('dotenv').config();
const mongoose = require('mongoose');

// Import models
const CorporateAccount = require('../lib/models/CorporateAccount').default;
const Admin = require('../lib/models/Admin').default;

async function testAdminModel() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/uspeak';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Create a test corporate account
    const corporateAccount = await CorporateAccount.create({
      companyName: 'Test Admin Company',
      subscriptionPlan: 'basic',
      customAttributes: {
        attribute1: { name: 'Division', values: ['Sales', 'Marketing'] },
        attribute2: { name: 'Function', values: ['Manager', 'Employee'] },
        attribute3: { name: 'Role', values: ['Admin', 'User'] }
      },
      maxEmployees: 100
    });
    console.log('Created test corporate account:', corporateAccount._id);

    // Test creating an admin user
    const testAdmin = await Admin.create({
      email: 'testadmin@testcompany.com',
      password: 'testpassword123',
      role: 'ADMIN',
      corporateAccountId: corporateAccount._id,
      firstName: 'Test',
      lastName: 'Admin',
      status: 'ACTIVE'
    });
    console.log('Successfully created admin user:', testAdmin._id);

    // Test finding the admin user
    const foundAdmin = await Admin.findOne({ email: 'testadmin@testcompany.com' });
    console.log('Found admin user:', foundAdmin ? 'Yes' : 'No');

    // Test password comparison
    const isPasswordValid = await foundAdmin.comparePassword('testpassword123');
    console.log('Password validation test:', isPasswordValid ? 'Passed' : 'Failed');

    // Test finding admin by corporate account
    const adminsByCompany = await Admin.find({ corporateAccountId: corporateAccount._id });
    console.log('Admins found for company:', adminsByCompany.length);

    // Clean up test data
    await Admin.findByIdAndDelete(testAdmin._id);
    await CorporateAccount.findByIdAndDelete(corporateAccount._id);
    console.log('Test data cleaned up');

    console.log('✅ Admin model test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed');
  }
}

testAdminModel();
