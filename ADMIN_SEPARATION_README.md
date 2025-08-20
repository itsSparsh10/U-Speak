# Admin User Separation Implementation

## Overview
This implementation separates admin users from regular users by creating a dedicated `Admin` collection in MongoDB. Admin registrations now go to the `Admin` collection instead of the `User` collection.

## Changes Made

### 1. New Admin Model (`lib/models/Admin.ts`)
- Created a separate `Admin` model with the same structure as `User` but specifically for admin accounts
- Role is fixed to 'ADMIN' only
- Includes all necessary fields: email, password, firstName, lastName, corporateAccountId, status, etc.
- Password hashing and comparison methods included
- Proper indexing for efficient queries

### 2. Updated Models Index (`lib/models/index.ts`)
- Added export for the new `Admin` model
- Maintains backward compatibility with existing imports

### 3. Modified Registration Route (`app/api/auth/register/route.ts`)
- Now creates admin users in the `Admin` collection instead of `User` collection
- Checks for existing admin emails in both `User` and `Admin` collections
- Sets role to 'ADMIN' for new admin accounts

### 4. Updated Login Route (`app/api/auth/login/route.ts`)
- Checks `Admin` collection first when role is 'admin'
- Falls back to `User` collection for regular users
- Returns appropriate user data based on collection source

### 5. Updated Test User Route (`app/api/auth/test-user/route.ts`)
- Now creates test admin accounts in the `Admin` collection
- Updated naming and logging for clarity

### 6. Modified Auth Library (`lib/auth.ts`)
- Updated to handle both `User` and `Admin` models
- Uses union type `AuthUser` for token generation
- Maintains compatibility with existing JWT structure

### 7. Updated User Model (`lib/models/User.ts`)
- Removed 'ADMIN' role from the enum since admins are now in separate collection
- Users can only have roles: 'CORPORATE_ADMIN', 'CORPORATE_USER', 'USER'

### 8. Updated Seed Script (`scripts/seed-database.js`)
- Now creates admin users in the `Admin` collection
- Maintains sample user creation in `User` collection

## Migration Scripts

### `scripts/migrate-admin-users.js`
- Migrates existing admin users from `User` collection to `Admin` collection
- Preserves all user data including passwords, timestamps, and relationships
- Optionally removes admin users from `User` collection after migration

### `scripts/test-admin-model.js`
- Tests the new `Admin` model functionality
- Verifies user creation, password validation, and queries
- Cleans up test data after testing

## Database Structure

### Admin Collection
- **Collection Name**: `admins`
- **Fields**: Same as User model but role is always 'ADMIN'
- **Indexes**: email, corporateAccountId, role, status

### User Collection
- **Collection Name**: `users`
- **Fields**: Same as before but without 'ADMIN' role
- **Indexes**: email, corporateAccountId, role, status

## Usage

### Creating New Admin Accounts
```javascript
// Admin registration now goes to Admin collection
const admin = await Admin.create({
  email: 'admin@company.com',
  password: 'securepassword',
  role: 'ADMIN', // Always 'ADMIN'
  corporateAccountId: corporateAccount._id,
  firstName: 'John',
  lastName: 'Admin',
  status: 'ACTIVE'
});
```

### Admin Authentication
```javascript
// Login checks Admin collection first for admin role
if (role === 'admin') {
  user = await Admin.findOne({ email: email.toLowerCase() });
}
```

## Benefits

1. **Clear Separation**: Admin and regular user data are completely separated
2. **Better Security**: Admin accounts are isolated from regular user accounts
3. **Scalability**: Easier to manage and scale admin-specific features
4. **Maintenance**: Simpler to maintain and update admin vs user logic
5. **Compliance**: Better data organization for compliance requirements

## Testing

Run the test script to verify the Admin model works correctly:
```bash
node scripts/test-admin-model.js
```

## Migration

To migrate existing admin users:
```bash
node scripts/migrate-admin-users.js
```

## Notes

- Existing admin users in the `User` collection will need to be migrated
- The system maintains backward compatibility during the transition
- All admin-related functionality now uses the `Admin` collection
- Regular user functionality remains unchanged
