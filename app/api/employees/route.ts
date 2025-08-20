import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User, Employee, CorporateAccount, License, AuditLog } from '@/lib/models';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

// GET - Fetch all employees for a corporate account
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Fetch employees directly from the Employee collection
    const employees = await Employee.aggregate([
      {
        $match: {
          isActive: true
        }
      },
      {
        $lookup: {
          from: 'licenses', // MongoDB collection name (lowercase)
          localField: 'licenseId',
          foreignField: '_id',
          as: 'license'
        }
      },
      {
        $unwind: {
          path: '$license',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          id: { $toString: '$_id' },
          firstName: 1,
          lastName: 1,
          email: 1,
          department: 1,
          jobTitle: 1,
          customAttributes: {
            attribute1: '$customAttributes.attribute1Value',
            attribute2: '$customAttributes.attribute2Value',
            attribute3: '$customAttributes.attribute3Value'
          },
          status: '$isActive',
          videosAnalyzed: { $literal: 0 }, // TODO: Fetch from actual analytics
          assignmentsCompleted: { $literal: 0 }, // TODO: Fetch from actual analytics
          overallScore: { $literal: 0 }, // TODO: Fetch from actual analytics
          lastActive: { $ifNull: ['$lastLoginAt', '$createdAt'] },
          licenseStatus: { $ifNull: ['$license.status', 'UNASSIGNED'] },
          phone: '$phoneNumber',
          employeeId: 1,
          hireDate: 1
        }
      }
    ]);
    
    console.log('Found employees with profiles:', employees.length);
    if (employees.length > 0) {
      console.log('Sample employee data:', JSON.stringify(employees[0], null, 2));
    }

    return NextResponse.json({ success: true, employees: employees });

  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new employee
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      department,
      jobTitle,
      city,
      state,
      country,
      customAttribute1,
      customAttribute2,
      customAttribute3,
      bio,
      licenseType,
      sendWelcomeEmail,
      assignLearningPath
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !department || !jobTitle) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if email already exists in both Employee and User collections
    const existingEmployee = await Employee.findOne({ email: email.toLowerCase() });
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    
    // If email exists, check if we should update or create new
    if (existingEmployee || existingUser) {
      // Check if this is an update request (check for update flag in body)
      if (body.updateExisting === true) {
        console.log('Updating existing employee record...');
        
        // Update existing employee
        if (existingEmployee) {
          existingEmployee.firstName = firstName;
          existingEmployee.lastName = lastName;
          existingEmployee.phoneNumber = phone;
          existingEmployee.department = department;
          existingEmployee.jobTitle = jobTitle;
          existingEmployee.customAttributes = {
            attribute1Value: customAttribute1,
            attribute2Value: customAttribute2,
            attribute3Value: customAttribute3
          };
          await existingEmployee.save();
          console.log('Updated existing employee:', existingEmployee._id);
        }
        
        // Update existing user
        if (existingUser) {
          existingUser.firstName = firstName;
          existingUser.lastName = lastName;
          await existingUser.save();
          console.log('Updated existing user:', existingUser._id);
        }
        
        return NextResponse.json({
          success: true,
          message: 'Employee updated successfully',
          employee: {
            id: existingEmployee?._id || existingUser?._id,
            firstName,
            lastName,
            email: existingEmployee?.email || existingUser?.email,
            updated: true
          }
        });
      }
      
      // Provide more helpful error message with existing record details
      let errorDetails = '';
      if (existingEmployee && existingUser) {
        errorDetails = `Email already exists as both Employee (${existingEmployee.firstName} ${existingEmployee.lastName}) and User`;
      } else if (existingEmployee) {
        errorDetails = `Email already exists as Employee: ${existingEmployee.firstName} ${existingEmployee.lastName}`;
      } else if (existingUser) {
        errorDetails = `Email already exists as User: ${existingUser.firstName} ${existingUser.lastName}`;
      }
      
      return NextResponse.json(
        { 
          error: 'Email already exists',
          details: errorDetails,
          suggestion: 'Set updateExisting: true in the request body to update existing record',
          existingRecord: {
            employee: existingEmployee ? {
              id: existingEmployee._id,
              firstName: existingEmployee.firstName,
              lastName: existingEmployee.lastName,
              department: existingEmployee.department
            } : null,
            user: existingUser ? {
              id: existingUser._id,
              firstName: existingUser.firstName,
              lastName: existingUser.lastName,
              role: existingUser.role
            } : null
          }
        },
        { status: 409 }
      );
    }

    // Get the corporate account ID from the request body
    // This must be provided by the frontend when creating employees
    if (!body.corporateAccountId) {
      return NextResponse.json(
        { error: 'Corporate account ID is required' },
        { status: 400 }
      );
    }
    
    const corporateAccountId = new mongoose.Types.ObjectId(body.corporateAccountId);
    
    // Verify the corporate account exists
    const corporateAccount = await CorporateAccount.findById(corporateAccountId);
    if (!corporateAccount) {
      return NextResponse.json(
        { error: 'Corporate account not found' },
        { status: 404 }
      );
    }
    
    // Create a license for the employee first
    const newLicense = await License.create({
      licenseType: licenseType || 'USPEAK_PRO',
      status: 'ASSIGNED',
      corporateAccountId: corporateAccountId,
      licenseKey: `USP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      features: ['VIDEO_ANALYSIS', 'LEARNING_LESSONS', 'PROGRESS_TRACKING'],
      maxUsers: 1
    });

    console.log('Created license:', newLicense._id);

    // Generate a temporary password for the employee
    const tempPassword = generateTempPassword();

    // Create User record for authentication (REQUIRED for login)
    const newUser = await User.create({
      email: email.toLowerCase(),
      password: tempPassword, // This will be hashed by the User model pre-save hook
      role: 'CORPORATE_USER',
      status: 'ACTIVE',
      corporateAccountId: corporateAccountId, // Use the same corporate account ID
      firstName,
      lastName
    });

    console.log('Created user for authentication:', newUser._id);

    // Create employee record directly
    const newEmployee = await Employee.create({
      corporateAccountId: corporateAccountId, // Use the same corporate account ID
      firstName,
      lastName,
      email: email.toLowerCase(),
      phoneNumber: phone,
      department,
      jobTitle,
      customAttributes: {
        attribute1Value: customAttribute1,
        attribute2Value: customAttribute2,
        attribute3Value: customAttribute3
      },
      employeeId: `EMP-${Date.now()}`, // Generate unique employee ID
      hireDate: new Date(),
      isActive: true,
      licenseId: newLicense._id
    });

    console.log('Created employee:', newEmployee._id);

    // Create audit log
    try {
      await AuditLog.create({
        performedByUserId: newUser._id, // Use the newly created user as the performer (temporary)
        corporateAccountId: corporateAccountId,
        actionType: 'ADD_EMPLOYEE',
        targetUserId: newUser._id, // Reference the User record, not Employee
        targetEmployeeId: newEmployee._id, // Reference the Employee record
        details: `Employee account created for ${firstName} ${lastName}`,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      });
      console.log('Created audit log');
    } catch (auditError) {
      console.error('Failed to create audit log:', auditError);
      // Don't fail the employee creation if audit log fails
    }

    console.log('Created audit log');

    // Simulate welcome email
    if (sendWelcomeEmail) {
      console.log('Welcome email would be sent to:', email);
    }

    // Simulate learning path assignment
    if (assignLearningPath) {
      console.log('Learning path would be assigned to:', email);
    }

    return NextResponse.json({
      success: true,
      message: 'Employee created successfully',
      employee: {
        id: newEmployee._id.toString(),
        firstName: newEmployee.firstName,
        lastName: newEmployee.lastName,
        email: newEmployee.email,
        tempPassword: tempPassword // Return the temporary password for the admin
      }
    });

  } catch (error) {
    console.error('Error creating employee:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to generate temporary password
function generateTempPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}
