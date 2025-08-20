require('dotenv').config();
const mongoose = require('mongoose');

// Import models
const CorporateAccount = require('../lib/models/CorporateAccount').default;
const User = require('../lib/models/User').default;
const AuditLog = require('../lib/models/AuditLog').default;

async function testAuditLog() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/uspeak';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Test creating an audit log with new action types
    console.log('Testing AuditLog model with new action types...');

    // Create a test corporate account
    const corporateAccount = await CorporateAccount.create({
      companyName: 'Test Audit Company',
      subscriptionPlan: 'basic',
      customAttributes: {
        attribute1: { name: 'Division', values: ['Sales'] },
        attribute2: { name: 'Function', values: ['Manager'] },
        attribute3: { name: 'Role', values: ['Admin'] }
      },
      maxEmployees: 100
    });
    console.log('Created test corporate account:', corporateAccount._id);

    // Create a test user
    const testUser = await User.create({
      email: 'testuser@testcompany.com',
      password: 'testpassword123',
      role: 'CORPORATE_USER',
      corporateAccountId: corporateAccount._id,
      firstName: 'Test',
      lastName: 'User',
      status: 'ACTIVE'
    });
    console.log('Created test user:', testUser._id);

    // Test 1: ADMIN_LOGIN action type
    try {
      const adminLoginLog = await AuditLog.create({
        performedByUserId: testUser._id,
        corporateAccountId: corporateAccount._id,
        actionType: 'ADMIN_LOGIN',
        details: 'Admin testuser@testcompany.com logged in successfully',
        ipAddress: '127.0.0.1',
        userAgent: 'Test Browser'
      });
      console.log('✅ ADMIN_LOGIN audit log created successfully:', adminLoginLog._id);
    } catch (error) {
      console.error('❌ Failed to create ADMIN_LOGIN audit log:', error.message);
    }

    // Test 2: USER_LOGIN action type
    try {
      const userLoginLog = await AuditLog.create({
        performedByUserId: testUser._id,
        corporateAccountId: corporateAccount._id,
        actionType: 'USER_LOGIN',
        details: 'User testuser@testcompany.com logged in successfully',
        ipAddress: '127.0.0.1',
        userAgent: 'Test Browser'
      });
      console.log('✅ USER_LOGIN audit log created successfully:', userLoginLog._id);
    } catch (error) {
      console.error('❌ Failed to create USER_LOGIN audit log:', error.message);
    }

    // Test 3: ADMIN_LOGOUT action type
    try {
      const adminLogoutLog = await AuditLog.create({
        performedByUserId: testUser._id,
        corporateAccountId: corporateAccount._id,
        actionType: 'ADMIN_LOGOUT',
        details: 'Admin testuser@testcompany.com logged out successfully',
        ipAddress: '127.0.0.1',
        userAgent: 'Test Browser'
      });
      console.log('✅ ADMIN_LOGOUT audit log created successfully:', adminLogoutLog._id);
    } catch (error) {
      console.error('❌ Failed to create ADMIN_LOGOUT audit log:', error.message);
    }

    // Test 4: USER_LOGOUT action type
    try {
      const userLogoutLog = await AuditLog.create({
        performedByUserId: testUser._id,
        corporateAccountId: corporateAccount._id,
        actionType: 'USER_LOGOUT',
        details: 'User testuser@testcompany.com logged out successfully',
        ipAddress: '127.0.0.1',
        userAgent: 'Test Browser'
      });
      console.log('✅ USER_LOGOUT audit log created successfully:', userLogoutLog._id);
    } catch (error) {
      console.error('❌ Failed to create USER_LOGOUT audit log:', error.message);
    }

    // Clean up test data
    await AuditLog.deleteMany({ performedByUserId: testUser._id });
    await User.findByIdAndDelete(testUser._id);
    await CorporateAccount.findByIdAndDelete(corporateAccount._id);
    console.log('Test data cleaned up');

    console.log('AuditLog model test completed!');

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed');
  }
}

testAuditLog();
