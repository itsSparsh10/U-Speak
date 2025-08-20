require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const CorporateAccount = require('../lib/models/CorporateAccount').default;
const User = require('../lib/models/User').default;
const Admin = require('../lib/models/Admin').default;
const License = require('../lib/models/License').default;

async function seedDatabase() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/uspeak';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing data
    await CorporateAccount.deleteMany({});
    await User.deleteMany({});
    await Admin.deleteMany({});
    await License.deleteMany({});
    console.log('Cleared existing data');

    // Create corporate account
    const corporateAccount = await CorporateAccount.create({
      companyName: 'Demo Corporation',
      subscriptionPlan: 'enterprise',
      customAttributes: {
        attribute1: { name: 'Division', values: ['North', 'South', 'East', 'West'] },
        attribute2: { name: 'Function', values: ['Sales', 'Marketing', 'Engineering', 'HR'] },
        attribute3: { name: 'Role Level', values: ['Junior', 'Senior', 'Manager', 'Director'] }
      },
      status: 'active',
      maxEmployees: 1000
    });
    console.log('Created corporate account:', corporateAccount.companyName);

    // Create admin user in Admin collection
    const hashedPassword = await bcrypt.hash('admin123', 12);
    const adminUser = await Admin.create({
      email: 'admin@democorp.com',
      password: hashedPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
      corporateAccountId: corporateAccount._id,
      firstName: 'Admin',
      lastName: 'User'
    });
    console.log('Created admin user:', adminUser.email);

    // Create licenses
    const licenseTypes = ['USPEAK_PRO', 'USPEAK_BASIC', 'USPEAK_ENTERPRISE'];
    const licenses = [];
    
    for (let i = 0; i < 50; i++) {
      const licenseType = licenseTypes[Math.floor(Math.random() * licenseTypes.length)];
      const license = await License.create({
        licenseType,
        corporateAccountId: corporateAccount._id,
        status: 'AVAILABLE',
        assignedTo: null,
        assignedAt: null,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        features: licenseType === 'USPEAK_ENTERPRISE' ? ['all'] : 
                 licenseType === 'USPEAK_PRO' ? ['basic', 'advanced'] : ['basic']
      });
      licenses.push(license);
    }
    console.log('Created', licenses.length, 'licenses');

    // Create some sample users
    const sampleUsers = [
      {
        email: 'john.doe@democorp.com',
        password: await bcrypt.hash('password123', 12),
        role: 'CORPORATE_USER',
        status: 'ACTIVE',
        corporateAccountId: corporateAccount._id,
        firstName: 'John',
        lastName: 'Doe'
      },
      {
        email: 'jane.smith@democorp.com',
        password: await bcrypt.hash('password123', 12),
        role: 'CORPORATE_USER',
        status: 'ACTIVE',
        corporateAccountId: corporateAccount._id,
        firstName: 'Jane',
        lastName: 'Smith'
      }
    ];

    for (const userData of sampleUsers) {
      await User.create(userData);
    }
    console.log('Created', sampleUsers.length, 'sample users');

    console.log('Database seeded successfully!');
    console.log('Admin credentials: admin@democorp.com / admin123');
    console.log('Sample user credentials: john.doe@democorp.com / password123');

  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed');
  }
}

seedDatabase();
