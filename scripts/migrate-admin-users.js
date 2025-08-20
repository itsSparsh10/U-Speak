require('dotenv').config();
const mongoose = require('mongoose');

// Import models
const User = require('../lib/models/User').default;
const Admin = require('../lib/models/Admin').default;

async function migrateAdminUsers() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/uspeak';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Find all users with ADMIN role
    const adminUsers = await User.find({ role: 'ADMIN' });
    console.log(`Found ${adminUsers.length} admin users to migrate`);

    if (adminUsers.length === 0) {
      console.log('No admin users found to migrate');
      return;
    }

    // Migrate each admin user
    for (const adminUser of adminUsers) {
      try {
        // Check if admin already exists in Admin collection
        const existingAdmin = await Admin.findOne({ email: adminUser.email });
        if (existingAdmin) {
          console.log(`Admin ${adminUser.email} already exists in Admin collection, skipping...`);
          continue;
        }

        // Create admin in Admin collection
        const newAdmin = await Admin.create({
          email: adminUser.email,
          password: adminUser.password, // Password is already hashed
          role: 'ADMIN',
          status: adminUser.status,
          corporateAccountId: adminUser.corporateAccountId,
          firstName: adminUser.firstName,
          lastName: adminUser.lastName,
          lastLoginAt: adminUser.lastLoginAt,
          passwordResetToken: adminUser.passwordResetToken,
          passwordResetExpires: adminUser.passwordResetExpires,
          createdAt: adminUser.createdAt,
          updatedAt: adminUser.updatedAt
        });

        console.log(`Successfully migrated admin user: ${adminUser.email} (ID: ${newAdmin._id})`);

        // Optionally, you can delete the admin user from User collection
        // await User.findByIdAndDelete(adminUser._id);
        // console.log(`Deleted admin user from User collection: ${adminUser.email}`);

      } catch (error) {
        console.error(`Failed to migrate admin user ${adminUser.email}:`, error);
      }
    }

    console.log('Admin user migration completed!');

  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed');
  }
}

migrateAdminUsers();
