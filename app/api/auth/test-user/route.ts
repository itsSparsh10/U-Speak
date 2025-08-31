import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { CorporateAccount } from '@/lib/models';

export async function POST(request: NextRequest) {
  try {
    console.log('Creating test admin...');
    
    await connectDB();
    console.log('Database connected');

    // Check if test admin already exists
    const existingAdmin = await CorporateAccount.findOne({ email: 'admin@testcompany.com' });
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

    // Create test admin user in CorporateAccount collection
    const testAdmin = await CorporateAccount.create({
      email: 'admin@testcompany.com',
      password: 'password123',
      role: 'ADMIN',
      companyName: 'Test Company Inc.',
      subscriptionPlan: 'basic',
      customAttributes: {
        attribute1: { name: 'Division', values: ['Sales', 'Marketing', 'Engineering'] },
        attribute2: { name: 'Function', values: ['Manager', 'Employee', 'Intern'] },
        attribute3: { name: 'Role', values: ['Admin', 'User', 'Viewer'] }
      },
      maxEmployees: 100,
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
        companyName: testAdmin.companyName
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
