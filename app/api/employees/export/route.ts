import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Employee } from '@/lib/models';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Fetch all employees with their complete data
    const employees = await Employee.find({ isActive: true }).lean();
    
    if (employees.length === 0) {
      return NextResponse.json(
        { error: 'No employees found' },
        { status: 404 }
      );
    }

    // Convert to CSV format
    const csvHeaders = [
      '_id',
      'corporateAccountId',
      'firstName',
      'lastName',
      'email',
      'phoneNumber',
      'department',
      'jobTitle',
      'attribute1Value',
      'attribute2Value',
      'attribute3Value',
      'employeeId',
      'hireDate',
      'isActive',
      'licenseId',
      'createdAt',
      'updatedAt'
    ];
    const csvRows = employees.map((emp: any) => [
      emp._id.toString(),
      emp.corporateAccountId?.toString() || '',
      `"${emp.firstName || ''}"`,
      `"${emp.lastName || ''}"`,
      `"${emp.email || ''}"`,
      `"${emp.phoneNumber || ''}"`,
      `"${emp.department || ''}"`,
      `"${emp.jobTitle || ''}"`,
      `"${emp.customAttributes?.attribute1Value || ''}"`,
      `"${emp.customAttributes?.attribute2Value || ''}"`,
      `"${emp.customAttributes?.attribute3Value || ''}"`,
      `"${emp.employeeId || ''}"`,
      emp.hireDate ? emp.hireDate.toISOString() : '',
      emp.isActive ? 'true' : 'false',
      emp.licenseId?.toString() || '',
      emp.createdAt ? emp.createdAt.toISOString() : '',
      emp.updatedAt ? emp.updatedAt.toISOString() : ''
    ]);

    const csvContent = [csvHeaders.join(','), ...csvRows.map(row => row.join(','))].join('\n');

    // Return CSV as downloadable file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="employees_export_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Internal server error during export' },
      { status: 500 }
    );
  }
}
