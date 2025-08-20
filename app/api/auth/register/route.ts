import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CorporateAccount from '@/lib/models/CorporateAccount';
import User from '@/lib/models/User';
import Admin from '@/lib/models/Admin';
import AuditLog from '@/lib/models/AuditLog';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const {
      companyName,
      subscriptionPlan,
      adminEmail,
      adminPassword,
      adminFirstName,
      adminLastName,
      customAttributes
    } = await request.json();

    // Validate required fields
    if (!companyName || !adminEmail || !adminPassword || !adminFirstName || !adminLastName) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    // Check if company already exists
    const existingCompany = await CorporateAccount.findOne({ companyName });
    if (existingCompany) {
      return NextResponse.json(
        { error: 'Company name already exists' },
        { status: 409 }
      );
    }

    // Check if admin email already exists in both User and Admin collections
    const existingUser = await User.findOne({ email: adminEmail.toLowerCase() });
    const existingAdmin = await Admin.findOne({ email: adminEmail.toLowerCase() });
    
    if (existingUser || existingAdmin) {
      return NextResponse.json(
        { error: 'Admin email already exists' },
        { status: 409 }
      );
    }

    // Create corporate account
    const corporateAccount = await CorporateAccount.create({
      companyName,
      subscriptionPlan: subscriptionPlan || 'basic',
      customAttributes: customAttributes || {
        attribute1: { name: 'Division', values: [] },
        attribute2: { name: 'Function', values: [] },
        attribute3: { name: 'Role', values: [] }
      },
      maxEmployees: subscriptionPlan === 'enterprise' ? 50000 : subscriptionPlan === 'professional' ? 1000 : 100
    });

    // Create admin user in Admin collection instead of User collection
    const adminUser = await Admin.create({
      email: adminEmail.toLowerCase(),
      password: adminPassword,
      role: 'ADMIN',
      corporateAccountId: corporateAccount._id,
      firstName: adminFirstName,
      lastName: adminLastName
    });

    // Log the account creation
    await AuditLog.create({
      performedByUserId: adminUser._id,
      corporateAccountId: corporateAccount._id,
      actionType: 'CREATE_CORPORATE_ACCOUNT',
      details: `Corporate account created for ${companyName} with admin ${adminEmail}`,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    });

    return NextResponse.json({
      success: true,
      message: 'Corporate account created successfully',
      corporateAccount: {
        id: corporateAccount._id.toString(),
        companyName: corporateAccount.companyName,
        subscriptionPlan: corporateAccount.subscriptionPlan
      },
      adminUser: {
        id: adminUser._id.toString(),
        email: adminUser.email,
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        role: adminUser.role
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
