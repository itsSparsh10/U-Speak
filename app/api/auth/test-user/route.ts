import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { CorporateAccount, Admin } from '@/lib/models';

export async function POST(request: NextRequest) {
  try {
    console.log('Creating test admin...');
    
    await connectDB();
    console.log('Database connected');

    // Check if test admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@testcompany.com' });
    if (existingAdmin) {
      return NextResponse.json({
        success: true,
        message: 'Test admin already exists',
        user: {
          email: existingAdmin.email,
          role: existingAdmin.role
        }
      });
    }

    // Create test corporate account
    const corporateAccount = await CorporateAccount.create({
      companyName: 'Test Company Inc.',
      subscriptionPlan: 'basic',
      customAttributes: {
        attribute1: { name: 'Division', values: ['Sales', 'Marketing', 'Engineering'] },
        attribute2: { name: 'Function', values: ['Manager', 'Employee', 'Intern'] },
        attribute3: { name: 'Role', values: ['Admin', 'User', 'Viewer'] }
      },
      maxEmployees: 100
    });

    console.log('Test corporate account created:', corporateAccount._id);

    // Create test admin user in Admin collection
    const testAdmin = await Admin.create({
      email: 'admin@testcompany.com',
      password: 'password123',
      role: 'ADMIN',
      corporateAccountId: corporateAccount._id,
      firstName: 'Test',
      lastName: 'Admin',
      status: 'ACTIVE'
    });

    console.log('Test admin created:', testAdmin._id);

    return NextResponse.json({
      success: true,
      message: 'Test admin created successfully',
      user: {
        email: testAdmin.email,
        role: testAdmin.role,
        companyName: corporateAccount.companyName
      }
    });

  } catch (error) {
    console.error('Test admin creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create test admin' },
      { status: 500 }
    );
  }
}
