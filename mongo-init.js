// MongoDB initialization script for USpeak Pro
// This script runs when the MongoDB container starts for the first time

// Switch to the uspeak-pro database
db = db.getSiblingDB('uspeak-pro');

// Create collections with proper indexes
db.createCollection('corporateaccounts');
db.createCollection('users');
db.createCollection('employeeprofiles');
db.createCollection('licenses');
db.createCollection('auditlogs');

// Create indexes for better performance
db.corporateaccounts.createIndex({ "companyName": 1 }, { unique: true });
db.corporateaccounts.createIndex({ "status": 1 });

db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "corporateAccountId": 1 });
db.users.createIndex({ "role": 1 });
db.users.createIndex({ "status": 1 });

db.employeeprofiles.createIndex({ "userId": 1 }, { unique: true });
db.employeeprofiles.createIndex({ "corporateAccountId": 1, "isActive": 1 });
db.employeeprofiles.createIndex({ "corporateAccountId": 1, "department": 1 });

db.licenses.createIndex({ "licenseKey": 1 }, { unique: true });
db.licenses.createIndex({ "corporateAccountId": 1 });
db.licenses.createIndex({ "status": 1 });

db.auditlogs.createIndex({ "corporateAccountId": 1, "timestamp": -1 });
db.auditlogs.createIndex({ "performedByUserId": 1, "timestamp": -1 });

print('✅ USpeak Pro database initialized successfully!');
print('📊 Collections created: corporateaccounts, users, employeeprofiles, licenses, auditlogs');
print('🔍 Indexes created for optimal performance');
