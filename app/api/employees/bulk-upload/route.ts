import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User, Employee, CorporateAccount, License, AuditLog } from '@/lib/models';

// Helper function to create audit logs for bulk upload
async function createBulkUploadAuditLog(
  corporateAccountId: any,
  actionType: string,
  details: string,
  request: NextRequest,
  targetEmployeeId?: any,
  targetUserId?: any,
  targetLicenseId?: any
) {
  try {
    // For bulk upload, we'll use the corporate account as the performer
    // In a real scenario, you'd get the actual user ID from the authentication context
    const auditLog = await AuditLog.create({
      performedByUserId: corporateAccountId, // Using corporate account ID as placeholder
      corporateAccountId: corporateAccountId,
      actionType: actionType,
      targetUserId: targetUserId,
      targetEmployeeId: targetEmployeeId,
      targetLicenseId: targetLicenseId,
      details: details,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date()
    });
    console.log(`📝 Audit log created: ${actionType} - ${details}`);
    return auditLog;
  } catch (error) {
    console.error('❌ Failed to create audit log:', error);
    // Don't fail the main operation if audit log fails
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting bulk upload process...');
    await connectDB();
    console.log('✅ Database connected successfully');
    
    const body = await request.json();
    console.log('📥 Received request body:', JSON.stringify(body, null, 2));
    const { employees, corporateAccountId, updateExisting = false } = body;

    if (!Array.isArray(employees) || employees.length === 0) {
      console.log('❌ No employees data provided');
      return NextResponse.json(
        { error: 'No employees data provided' },
        { status: 400 }
      );
    }
    
    console.log(`📊 Processing ${employees.length} employees...`);

    // Create a default corporate account
    console.log('🏗️ Creating default corporate account...');
    const corporateAccount = await CorporateAccount.create({
      companyName: `Test Company ${Date.now()}`,
      status: 'active',
      subscriptionPlan: 'basic',
      maxEmployees: 1000
    });
    console.log(`✅ Created corporate account: ${corporateAccount._id}`);
    
    // Create audit log for corporate account creation
    await createBulkUploadAuditLog(
      corporateAccount._id,
      'CREATE_CORPORATE_ACCOUNT',
      `Corporate account created for bulk upload: ${corporateAccount.companyName}`,
      request
    );

    const results = {
      success: 0,
      failed: 0,
      created: 0,
      updated: 0,
      errors: [] as string[]
    };

    // Process each employee
    for (let i = 0; i < employees.length; i++) {
      const employeeData = employees[i];
      console.log(`👤 Processing employee ${i + 1}/${employees.length}: ${employeeData.firstName} ${employeeData.lastName}`);
      
      try {
        // Validate required fields
        if (!employeeData.firstName || !employeeData.lastName || !employeeData.email) {
          console.log(`❌ Row ${i + 1}: Missing required fields`);
          results.failed++;
          results.errors.push(`Row ${i + 1}: Missing required fields (firstName, lastName, or email)`);
          continue;
        }

        const email = employeeData.email.toLowerCase().trim();
        
        // Check if employee already exists
        const existingEmployee = await Employee.findOne({ email });
        const existingUser = await User.findOne({ email });

        if (existingEmployee || existingUser) {
          console.log(`⚠️ Employee with email ${email} already exists`);
          results.failed++;
          results.errors.push(`Row ${i + 1}: Employee with email ${email} already exists`);
          continue;
        }

        // Create new employee
        console.log(`🏗️ Creating new employee: ${email}`);
        
        // Create license
        const newLicense = await License.create({
          licenseType: 'USPEAK_PRO',
          status: 'ASSIGNED',
          corporateAccountId: corporateAccount._id,
          licenseKey: `USP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          features: ['VIDEO_ANALYSIS', 'LEARNING_LESSONS', 'PROGRESS_TRACKING'],
          maxUsers: 1
        });
        console.log(`✅ Created license: ${newLicense._id}`);

        // Generate a simple password
        const tempPassword = 'TempPass123!';

        // Create User record
        const newUser = await User.create({
          email,
          password: tempPassword,
          role: 'CORPORATE_USER',
          status: 'ACTIVE',
          corporateAccountId: corporateAccount._id,
          firstName: employeeData.firstName,
          lastName: employeeData.lastName
        });
        console.log(`✅ Created user: ${newUser._id}`);

        // Create Employee record
        const newEmployee = await Employee.create({
          corporateAccountId: corporateAccount._id,
          firstName: employeeData.firstName,
          lastName: employeeData.lastName,
          email,
          phoneNumber: employeeData.phoneNumber || '',
          department: employeeData.department || '',
          jobTitle: employeeData.jobTitle || '',
          customAttributes: {
            attribute1Value: employeeData.attribute1Value || '',
            attribute2Value: employeeData.attribute2Value || '',
            attribute3Value: employeeData.attribute3Value || ''
          },
          employeeId: `EMP-${Date.now()}-${i}`,
          hireDate: new Date(),
          isActive: true,
          licenseId: newLicense._id
        });
        console.log(`✅ Created employee: ${newEmployee._id}`);

        // Create audit log for employee creation
        await createBulkUploadAuditLog(
          corporateAccount._id,
          'ADD_EMPLOYEE',
          `Employee created via bulk upload: ${employeeData.firstName} ${employeeData.lastName} (${email})`,
          request,
          newEmployee._id,
          newUser._id,
          newLicense._id
        );
        
        results.created++;
        results.success++;
        console.log(`✅ Successfully created employee ${i + 1}`);
        
      } catch (error) {
        console.error(`❌ Error processing employee ${i + 1}:`, error);
        results.failed++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.errors.push(`Row ${i + 1}: ${errorMessage}`);
      }
    }

    console.log('🎉 Bulk upload completed!');
    
    // Create audit log for the overall bulk upload operation
    await createBulkUploadAuditLog(
      corporateAccount._id,
      'BULK_UPLOAD',
      `Bulk upload completed: ${results.created} employees created, ${results.failed} failed, ${results.success} total successful`,
      request
    );
    
    return NextResponse.json({
      success: true,
      message: `Bulk upload completed. ${results.success} successful, ${results.failed} failed.`,
      results
    });

  } catch (error) {
    console.error('❌ Bulk upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error during bulk upload' },
      { status: 500 }
    );
  }
}
