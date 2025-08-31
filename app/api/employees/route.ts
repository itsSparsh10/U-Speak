import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User, EmployeeProfile, CorporateAccount, License, AuditLog } from '@/lib/models';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';
import mongoose from 'mongoose';

// Helper function to validate and extract names from email
function validateAndExtractNames(firstName: string, lastName: string, email: string) {
  // Check if we have meaningful names
  if (!firstName || !lastName || firstName === 'Unknown' || lastName === 'User') {
    if (email) {
      const emailLocal = email.split('@')[0];
      const nameParts = emailLocal.split(/[._-]/);
      
      if (nameParts.length >= 2) {
        // Extract first and last name from email parts
        return {
          firstName: nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1).toLowerCase(),
          lastName: nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1).toLowerCase()
        };
      } else if (emailLocal.length > 2) {
        // Use email local part as first name
        return {
          firstName: emailLocal.charAt(0).toUpperCase() + emailLocal.slice(1).toLowerCase(),
          lastName: 'Employee'
        };
      }
    }
    throw new Error('Cannot create employee profile with incomplete name data. Please provide valid first and last names.');
  }
  
  // Prevent explicit "Unknown" and "User" values
  if (firstName === 'Unknown') {
    throw new Error('First name cannot be "Unknown". Please provide a valid first name.');
  }
  
  if (lastName === 'User') {
    throw new Error('Last name cannot be "User". Please provide a valid last name.');
  }
  
  return { firstName, lastName };
}

// GET - Fetch employees with flexible query options
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    
    // Special operation: Fix user relationships if requested
    const fixUserRelationships = searchParams.get('fix-user-relationships');
    if (fixUserRelationships === 'true') {
      console.log('Fixing user relationships...');
      
      // Find employees with missing or incorrect user relationships
      const employeesWithoutUsers = await EmployeeProfile.find({ isActive: true });
      let fixedCount = 0;
      
      for (const employee of employeesWithoutUsers) {
        // Try to find a matching user by email
        const matchingUser = await User.findOne({ 
          email: { $regex: new RegExp(employee.first_name + '.*' + employee.last_name, 'i') }
        }) || await User.findOne({ 
          email: { $regex: new RegExp(employee.first_name, 'i') }
        });
        
        if (matchingUser && employee.user_id.toString() !== matchingUser._id.toString()) {
          console.log(`Fixing relationship for ${employee.first_name} ${employee.last_name}: ${employee.user_id} -> ${matchingUser._id}`);
          employee.user_id = matchingUser._id;
          await employee.save();
          fixedCount++;
        }
      }
      
      return NextResponse.json({ 
        success: true, 
        message: `Fixed ${fixedCount} user relationships`,
        fixedCount 
      });
    }

    // Support different query methods based on query parameters
    const queryMethod = searchParams.get('method') || 'all'; 
    const targetId = searchParams.get('targetId');
    const accountId = searchParams.get('accountId'); // Optional account filtering
    const includeOrphans = searchParams.get('includeOrphans') === 'true';
    
    // Safely build ObjectId once (prevents runtime error if invalid)
    let accountObjId: mongoose.Types.ObjectId | null = null;
    if (accountId && mongoose.Types.ObjectId.isValid(accountId)) {
      accountObjId = new mongoose.Types.ObjectId(accountId);
    }
    
    let matchStage: any = { isActive: true };
    
    // Add specific matching based on query method
    if (queryMethod === 'by-profile-id' && targetId) {
      // Query by EmployeeProfile ObjectId
      matchStage._id = new mongoose.Types.ObjectId(targetId);
    } else if (queryMethod === 'by-user-id' && targetId) {
      // Query by User ObjectId
      matchStage.user_id = new mongoose.Types.ObjectId(targetId);
    } else if (queryMethod === 'by-account' && accountId) {
      // Query by account ID through user relationship
      // This will be handled in the aggregation pipeline
    }
    // For method='all', no additional filtering is added
    
    // Fetch employees with flexible aggregation pipeline
    const pipeline: any[] = [
      {
        $match: matchStage
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true
        }
      }
    ];

    // Add account filtering if needed
    if (queryMethod === 'by-account' && accountId) {
      if (includeOrphans) {
        pipeline.push({
          $match: {
            $or: [
              { 'user.account_id': accountObjId }, // proper match
              { user: null }, // missing user after unwind
              { 'user.account_id': { $exists: false } } // user without account_id
            ]
          }
        });
      } else if (queryMethod === 'by-account' && searchParams.get('all') === 'true') {
        // Don't add any account filtering when the 'all' flag is true
        console.log('Returning all employees without account filtering');
      } else {
        pipeline.push({
          $match: {
            'user.account_id': accountObjId
          }
        });
      }
    }

    // Add license lookup
    pipeline.push(
      {
        $lookup: {
          from: 'licenses',
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
          userId: { $toString: '$user_id' },
          firstName: '$first_name',
          lastName: '$last_name',
          email: { $ifNull: ['$user.email', 'no-email@example.com'] },
          department: 1,
          jobTitle: '$job_title',
          customAttributes: {
            $ifNull: ['$custom_attributes', {}]
          },
          status: '$isActive',
          videosAnalyzed: { $literal: 0 }, // TODO: Fetch from actual analytics
          assignmentsCompleted: { $literal: 0 }, // TODO: Fetch from actual analytics
          overallScore: { $literal: 0 }, // TODO: Fetch from actual analytics
          lastActive: { $ifNull: ['$lastLoginAt', '$created_at'] },
          licenseStatus: { $ifNull: ['$license.status', 'UNASSIGNED'] },
          phone: '$phoneNumber',
          hireDate: 1,
          // Diagnostic linkage info
          accountMatch: accountObjId ? { $cond: [{ $eq: ['$user.account_id', accountObjId] }, true, false] } : null,
          orphan: { $cond: [{ $ifNull: ['$user._id', false] }, false, true] },
          mismatchReason: accountObjId ? {
            $switch: {
              branches: [
                { case: { $eq: ['$user.account_id', accountObjId] }, then: 'MATCH' },
                { case: { $eq: ['$user._id', null] }, then: 'NO_USER_DOCUMENT' },
                { case: { $not: ['$user.account_id'] }, then: 'USER_NO_ACCOUNT_ID' }
              ],
              default: 'ACCOUNT_MISMATCH'
            }
          } : null,
          userInfo: {
            hasUser: { $cond: [{ $ifNull: ['$user._id', false] }, true, false] },
            userEmail: '$user.email',
            userId: { $toString: '$user._id' },
            accountId: { $toString: '$user.account_id' }
          }
        }
      }
    );

    const employees = await EmployeeProfile.aggregate(pipeline);
    
    console.log('Query method:', queryMethod);
    console.log('Target ID:', targetId);
    console.log('Match stage:', JSON.stringify(matchStage));
    console.log('Found employees with profiles:', employees.length);
    if (employees.length > 0) {
      console.log('Sample employee data:', JSON.stringify(employees[0], null, 2));
    }

    return NextResponse.json({ success: true, data: employees });

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
      bio,
      licenseType,
      sendWelcomeEmail,
      assignLearningPath
    } = body;

    // Validate required fields
    if (!email || !department || !jobTitle) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate and extract names
    const validatedNames = validateAndExtractNames(firstName, lastName, email);

    // Check if email already exists in User collection
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    // If email exists, check update/create logic
    if (existingUser) {
      // If caller explicitly asked to update an existing profile, follow update flow
      if (body.updateExisting === true) {
        console.log('Updating existing employee record...');

        // Update existing user (if needed)
        existingUser.firstName = validatedNames.firstName;
        existingUser.lastName = validatedNames.lastName;
        existingUser.first_name = validatedNames.firstName;
        existingUser.last_name = validatedNames.lastName;
        await existingUser.save();
        console.log('Updated existing user:', existingUser._id);

        // Update or create EmployeeProfile linked to this user
        let existingEmployeeProfile = await EmployeeProfile.findOne({ user_id: existingUser._id });
        if (!existingEmployeeProfile) {
          // Create a profile if missing
          let baseEmployeeId = body.employeeId && String(body.employeeId).trim() ? String(body.employeeId).trim() : `EMP-${Date.now()}`;
          let employeeIdToUse = baseEmployeeId;
          let idCounter = 0;
          while (await EmployeeProfile.findOne({ employeeId: employeeIdToUse })) {
            idCounter++;
            employeeIdToUse = `${baseEmployeeId}-${idCounter}`;
          }

          existingEmployeeProfile = await EmployeeProfile.create({
            user_id: existingUser._id,
            first_name: validatedNames.firstName,
            last_name: validatedNames.lastName,
            phoneNumber: phone,
            department,
            job_title: jobTitle,
            hireDate: new Date(),
            isActive: true,
            employeeId: employeeIdToUse
          });

          console.log('Created missing employee profile for existing user:', existingEmployeeProfile._id);
        } else {
          // Update fields and ensure employeeId
          existingEmployeeProfile.first_name = validatedNames.firstName;
          existingEmployeeProfile.last_name = validatedNames.lastName;
          existingEmployeeProfile.phoneNumber = phone;
          existingEmployeeProfile.department = department;
          existingEmployeeProfile.job_title = jobTitle;

          if (!existingEmployeeProfile.employeeId) {
            let baseEmpId = body.employeeId && String(body.employeeId).trim() ? String(body.employeeId).trim() : `EMP-${Date.now()}`;
            let uniqueEmpId = baseEmpId;
            let counter = 0;
            while (await EmployeeProfile.findOne({ employeeId: uniqueEmpId })) {
              counter++;
              uniqueEmpId = `${baseEmpId}-${counter}`;
            }
            existingEmployeeProfile.employeeId = uniqueEmpId;
          }

          await existingEmployeeProfile.save();
          console.log('Updated existing employee profile:', existingEmployeeProfile._id);
        }

        return NextResponse.json({
          success: true,
          message: 'Employee updated successfully',
          employee: {
            id: existingUser._id,
            firstName: validatedNames.firstName,
            lastName: validatedNames.lastName,
            email: existingUser.email,
            updated: true
          }
        });
      }

      // If caller did not set updateExisting, but a User exists, attempt to create profile if missing
      const existingProfile = await EmployeeProfile.findOne({ user_id: existingUser._id });
      if (!existingProfile) {
        // Generate a unique employeeId
        let baseEmployeeId = body.employeeId && String(body.employeeId).trim() ? String(body.employeeId).trim() : `EMP-${Date.now()}`;
        let employeeIdToUse = baseEmployeeId;
        let idCounter = 0;
        while (await EmployeeProfile.findOne({ employeeId: employeeIdToUse })) {
          idCounter++;
          employeeIdToUse = `${baseEmployeeId}-${idCounter}`;
        }

        const createdProfile = await EmployeeProfile.create({
          user_id: existingUser._id,
          first_name: validatedNames.firstName,
          last_name: validatedNames.lastName,
          phoneNumber: phone,
          department,
          job_title: jobTitle,
          hireDate: new Date(),
          isActive: true,
          employeeId: employeeIdToUse
        });

        return NextResponse.json({
          success: true,
          message: 'Employee profile created and linked to existing user',
          employee: {
            id: createdProfile._id.toString(),
            userId: existingUser._id.toString(),
            firstName: createdProfile.first_name,
            lastName: createdProfile.last_name,
            email: existingUser.email,
            employeeId: createdProfile.employeeId
          }
        }, { status: 201 });
      }

      // If both User and EmployeeProfile exist, return informative success (avoid hard 409 to simplify frontend handling)
      return NextResponse.json(
        {
          success: true,
          message: 'User and employee profile already exist',
          existing: true,
          existingRecord: {
            user: {
              id: existingUser._id,
              email: existingUser.email,
              role: existingUser.role
            },
            profile: existingProfile ? { id: existingProfile._id, employeeId: existingProfile.employeeId } : null
          }
        },
        { status: 200 }
      );
    }

    // Get the admin ID from the request body (admin acts as corporate account)
    // This must be provided by the frontend when creating employees
    if (!body.corporateAccountId) {
      return NextResponse.json(
        { error: 'Admin ID is required' },
        { status: 400 }
      );
    }
    
    // Validate that corporateAccountId is a valid ObjectId
    let adminId: mongoose.Types.ObjectId;
    try {
      console.log('Received corporateAccountId:', body.corporateAccountId);
      console.log('Type:', typeof body.corporateAccountId);
      console.log('Length:', body.corporateAccountId?.length);
      
      // Clean the ID by removing any extra characters
      const cleanId = String(body.corporateAccountId).trim();
      
      if (!cleanId) {
        return NextResponse.json(
          { error: 'Corporate account ID is required' },
          { status: 400 }
        );
      }
      
      if (cleanId.length !== 24) {
        return NextResponse.json(
          { 
            error: 'Invalid admin ID format', 
            details: `Expected 24 characters, got ${cleanId.length}`,
            receivedId: cleanId
          },
          { status: 400 }
        );
      }
      
      adminId = new mongoose.Types.ObjectId(cleanId);
      console.log('Successfully created ObjectId:', adminId);
    } catch (error) {
      console.error('ObjectId creation error:', error);
      return NextResponse.json(
        { 
          error: 'Invalid admin ID format',
          details: error instanceof Error ? error.message : 'Unknown error',
          receivedId: body.corporateAccountId
        },
        { status: 400 }
      );
    }
    
    // Verify the admin exists
    const admin = await CorporateAccount.findById(adminId);
    if (!admin) {
      return NextResponse.json(
        { error: 'Admin not found' },
        { status: 404 }
      );
    }
    
    // Create a license for the employee first
    const newLicense = await License.create({
      license_type: licenseType || 'USPEAK_PRO',
      status: 'ASSIGNED',
      license_key: `USP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      features: ['VIDEO_ANALYSIS', 'LEARNING_LESSONS', 'PROGRESS_TRACKING'],
      maxUsers: 1
    });

    console.log('Created license:', newLicense._id);

    // Generate a temporary password for the employee
    const tempPassword = generateTempPassword();

    // Create User record for authentication (REQUIRED for login)
    const newUser = await User.create({
      email: email.toLowerCase(),
      password_hash: tempPassword, // This will be hashed by the User model pre-save hook
      role: 'EMPLOYEE',
      status: 'ACTIVE',
      account_id: adminId, // Reference the admin as corporate account
      firstName: validatedNames.firstName,
      lastName: validatedNames.lastName,
      first_name: validatedNames.firstName,
      last_name: validatedNames.lastName
    });

    console.log('Created user for authentication:', newUser._id);

    // Ensure a valid, unique employeeId is available for the EmployeeProfile
    let baseEmployeeId = body.employeeId && String(body.employeeId).trim() ? String(body.employeeId).trim() : `EMP-${Date.now()}`;
    let employeeIdToUse = baseEmployeeId;
    let idCounter = 0;
    while (await EmployeeProfile.findOne({ employeeId: employeeIdToUse })) {
      idCounter++;
      employeeIdToUse = `${baseEmployeeId}-${idCounter}`;
    }

    // Create employee profile record
    const newEmployee = await EmployeeProfile.create({
      user_id: newUser._id, // Link to the User record
      first_name: validatedNames.firstName,
      last_name: validatedNames.lastName,
      phoneNumber: phone,
      department,
      job_title: jobTitle,
      hireDate: new Date(),
      isActive: true,
      licenseId: newLicense._id,
      employeeId: employeeIdToUse
    });

    console.log('Created employee profile:', newEmployee._id);

    // Update license to assign it to the employee
    await License.findByIdAndUpdate(newLicense._id, {
      assigned_to_employee_id: newEmployee._id,
      assigned_at: new Date()
    });

    // Create audit log
    try {
      await AuditLog.create({
        performed_by_user_id: newUser._id, // Use the newly created user as the performer
        target_user_id: newUser._id, // Reference the User record
        action_type: 'ADD_EMPLOYEE',
        details: `Employee account created for ${validatedNames.firstName} ${validatedNames.lastName}`,
        timestamp: new Date()
      });
      console.log('Created audit log');
    } catch (auditError) {
      console.error('Failed to create audit log:', auditError);
      // Don't fail the employee creation if audit log fails
    }

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
        id: (newEmployee._id as mongoose.Types.ObjectId).toString(),
        firstName: newEmployee.first_name,
        lastName: newEmployee.last_name,
        email: email,
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
