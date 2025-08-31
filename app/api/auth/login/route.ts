import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User, CorporateAccount, AuditLog, EmployeeProfile } from '@/lib/models';
import { generateToken } from '@/lib/auth';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    console.log('Login API called');
    
    await connectDB();
    console.log('Database connected successfully');

    const { email, password, role } = await request.json();
    console.log('Login attempt for:', { email, role });

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    let user;
    let adminRecord;
    let isAdmin = false;

    // First, check if user exists in User collection (this includes all users: admins, employees, etc.)
    user = await User.findOne({ email: email.toLowerCase() }).populate('account_id');
    console.log('User record found:', user ? 'Yes' : 'No');
    
    // If user exists and has CORPORATE_ADMIN role, get the admin record
    if (user && user.role === 'CORPORATE_ADMIN') {
      adminRecord = await CorporateAccount.findById(user.account_id);
      isAdmin = true;
      console.log('Admin record found:', adminRecord ? 'Yes' : 'No');
      if (adminRecord) {
        console.log('Admin record data:', {
          firstName: adminRecord.firstName,
          lastName: adminRecord.lastName,
          email: adminRecord.email
        });
      }
    }

    // If no user found in User collection, check Admin collection (legacy fallback)
    if (!user && role === 'admin') {
      adminRecord = await CorporateAccount.findOne({ email: email.toLowerCase() });
      if (adminRecord) {
        // Create a User record for this admin if it doesn't exist
        user = await User.create({
          email: adminRecord.email,
          password_hash: adminRecord.password, // This will be hashed by pre-save hook
          role: 'CORPORATE_ADMIN',
          status: adminRecord.status,
          account_id: adminRecord._id
        });
        isAdmin = true;
        console.log('Created User record for existing admin');
      }
    }

    // If still no user found, check if it's an employee login
    if (!user) {
      user = await User.findOne({ email: email.toLowerCase() }).populate('account_id');
      console.log('Employee/User login attempt, user found:', user ? 'Yes' : 'No');
      
      // If user exists but has no account_id, try to fix it from Employee record
      if (user && !user.account_id) {
        console.log('User found but missing account_id, attempting to fix...');
        const employee = await EmployeeProfile.findOne({ email: email.toLowerCase() });
        
        if (employee && (employee as any).account_id) {
          console.log('Found matching employee, updating user account_id...');
          user.account_id = (employee as any).account_id;
          await user.save();
          console.log('User account_id updated successfully');
        }
      }
    }
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Account is deactivated' },
        { status: 401 }
      );
    }

    // Check if corporate account is active (for non-admin users)
    if (!isAdmin && user.account_id) {
      const corporateAccount = user.account_id as any;
      if (corporateAccount.status !== 'ACTIVE') {
        return NextResponse.json(
          { error: 'Corporate account is suspended' },
          { status: 401 }
        );
      }
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    console.log('Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();
    console.log('Last login updated');

    // Debug: Log user object before generating token
    console.log('User object before token generation:', {
      _id: user._id,
      email: user.email,
      role: user.role,
      account_id: isAdmin ? user.account_id : user.account_id,
      firstName: isAdmin ? (adminRecord as any)?.firstName : 'N/A',
      lastName: isAdmin ? (adminRecord as any)?.lastName : 'N/A'
    });

    // Generate JWT token
    const token = await generateToken(user);
    console.log('Token generated');

    // Log the login action - handle missing account_id
    try {
      if (user.account_id) {
        const auditCorporateAccountId = user.account_id._id || user.account_id;
        
        // Determine specific action type based on user role
        let actionType = 'LOGIN';
        if (isAdmin) {
          actionType = 'ADMIN_LOGIN';
        } else if (user.role === 'EMPLOYEE' || user.role === 'CORPORATE_USER') {
          actionType = 'EMPLOYEE_LOGIN';
        } else if (user.role === 'CORPORATE_ADMIN') {
          actionType = 'ADMIN_LOGIN';
        } else {
          actionType = 'USER_LOGIN';
        }
        
        await AuditLog.create({
          performed_by_user_id: user._id,
          action_type: actionType,
          details: `${isAdmin ? 'Admin' : user.role === 'EMPLOYEE' ? 'Employee' : 'User'} ${user.email} logged in successfully`,
          timestamp: new Date()
        });
      } else {
        console.log('Skipping audit log creation - user has no corporate account');
      }
    } catch (auditError) {
      console.error('Failed to log login action:', auditError);
    }

    // Return user data - handle different field structures for Admin vs User
    let userData: any = {};

    if (isAdmin && adminRecord) {
      // For admin users, use data from CorporateAccount
      userData = {
        id: user._id.toString(),
        email: adminRecord.email,
        firstName: adminRecord.firstName || '',
        lastName: adminRecord.lastName || '',
        role: 'ADMIN',
        corporateAccountId: (user.account_id?._id || user.account_id)?.toString(),
        companyName: adminRecord.companyName || ''
      };
      console.log('Login API - Admin user data:', userData);
    } else {
      // For regular users, use data from User model
      userData = {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName || user.first_name || '',
        lastName: user.lastName || user.last_name || '',
        role: user.role,
        corporateAccountId: user.account_id ? (user.account_id._id || user.account_id).toString() : null,
        companyName: user.account_id ? (user.account_id as any).companyName : null
      };

      // If this is a corporate user and we don't have names, try to get from EmployeeProfile
      if (user.role !== 'CORPORATE_ADMIN' && (!userData.firstName || !userData.lastName)) {
        try {
          const employee = await EmployeeProfile.findOne({ email: email.toLowerCase() });
          if (employee) {
            userData.firstName = userData.firstName || employee.first_name;
            userData.lastName = userData.lastName || employee.last_name;
            userData.jobTitle = employee.job_title;
            userData.department = employee.department;
            userData.employeeId = employee.employeeId;
          }
        } catch (error) {
          console.log('Could not fetch employee details:', error);
        }
      }
    }

    // Debug: Log the userData being returned
    console.log('Login API - User data being returned:', {
      id: userData.id,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role,
      companyName: userData.companyName,
      isAdmin,
      adminRecordExists: !!adminRecord
    });

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      token,
      user: userData
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
