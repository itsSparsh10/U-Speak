import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User, Admin, CorporateAccount, AuditLog, Employee } from '@/lib/models';
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
    let isAdmin = false;

    // Check if user is trying to login as admin
    if (role === 'admin') {
      // Look for admin in Admin collection first
      user = await Admin.findOne({ email: email.toLowerCase() }).populate('corporateAccountId');
      isAdmin = true;
      console.log('Admin login attempt, user found:', user ? 'Yes' : 'No');
    }

    // If not admin or admin not found, check User collection (includes employees)
    if (!user) {
      user = await User.findOne({ email: email.toLowerCase() }).populate('corporateAccountId');
      console.log('User/Employee login attempt, user found:', user ? 'Yes' : 'No');
      
      // If user exists but has no corporateAccountId, try to fix it from Employee record
      if (user && !user.corporateAccountId) {
        console.log('User found but missing corporateAccountId, attempting to fix...');
        const employee = await Employee.findOne({ email: email.toLowerCase() });
        
        if (employee && (employee as any).corporateAccountId) {
          console.log('Found matching employee, updating user corporateAccountId...');
          user.corporateAccountId = (employee as any).corporateAccountId;
          await user.save();
          console.log('User corporateAccountId updated successfully');
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

    // Check if corporate account is active
    const corporateAccount = user.corporateAccountId as any;
    if (corporateAccount && corporateAccount.status !== 'active') {
      return NextResponse.json(
        { error: 'Corporate account is suspended' },
        { status: 401 }
      );
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
      corporateAccountId: user.corporateAccountId,
      firstName: user.firstName,
      lastName: user.lastName
    });

    // Generate JWT token
    const token = await generateToken(user);
    console.log('Token generated');

    // Log the login action - handle missing corporateAccountId
    try {
      if (user.corporateAccountId) {
        const auditCorporateAccountId = user.corporateAccountId._id || user.corporateAccountId;
        
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
          performedByUserId: user._id,
          corporateAccountId: auditCorporateAccountId,
          actionType: actionType,
          details: `${isAdmin ? 'Admin' : user.role === 'EMPLOYEE' ? 'Employee' : 'User'} ${user.email} logged in successfully`,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        });
      } else {
        console.log('Skipping audit log creation - user has no corporate account');
      }
    } catch (auditError) {
      console.error('Failed to log login action:', auditError);
    }

    // Return user data - handle missing corporateAccountId
    const userData: any = {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: isAdmin ? 'ADMIN' : user.role,
      corporateAccountId: user.corporateAccountId ? 
        (user.corporateAccountId._id || user.corporateAccountId).toString() : 
        null,
      companyName: corporateAccount ? corporateAccount.companyName : null
    };

    // If this is a corporate user (not admin), try to get additional employee details
    if (!isAdmin && user.role !== 'CORPORATE_ADMIN') {
      try {
        const employee = await Employee.findOne({ email: email.toLowerCase() });
        if (employee) {
          userData.jobTitle = employee.jobTitle;
          userData.department = employee.department;
          userData.employeeId = employee.employeeId;
        }
      } catch (error) {
        console.log('Could not fetch employee details:', error);
      }
    }

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
