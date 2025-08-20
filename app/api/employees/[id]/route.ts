import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Employee, User, CorporateAccount, License } from '@/lib/models';
import mongoose from 'mongoose';

// GET - Fetch individual employee profile
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    let { id: employeeId } = await params;
    
    // Check if it's a valid MongoDB ObjectId
    let isValidObjectId = mongoose.Types.ObjectId.isValid(employeeId);
    
    // If not a valid ObjectId, try to find by employeeId field
    if (!isValidObjectId) {
      console.log('Not a valid ObjectId, searching by employeeId field:', employeeId);
      // Try to find employee by employeeId field instead
      const employeeByCode = await Employee.findOne({ employeeId: employeeId });
      if (employeeByCode) {
        // Use the MongoDB _id from the found employee
        employeeId = employeeByCode._id.toString();
        isValidObjectId = true;
        console.log('Found employee by employeeId, using MongoDB _id:', employeeId);
      } else {
        return NextResponse.json(
          { error: 'Employee not found with ID: ' + employeeId },
          { status: 404 }
        );
      }
    }

    // Fetch employee with populated data
    const employee = await Employee.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(employeeId)
        }
      },
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
        $lookup: {
          from: 'corporateaccounts',
          localField: 'corporateAccountId',
          foreignField: '_id',
          as: 'corporateAccount'
        }
      },
      {
        $unwind: {
          path: '$corporateAccount',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          id: { $toString: '$_id' },
          firstName: 1,
          lastName: 1,
          email: 1,
          phoneNumber: 1,
          department: 1,
          jobTitle: 1,
          employeeId: 1,
          hireDate: 1,
          customAttributes: {
            attribute1: '$customAttributes.attribute1Value',
            attribute2: '$customAttributes.attribute2Value',
            attribute3: '$customAttributes.attribute3Value'
          },
          status: { $ifNull: ['$isActive', true] },
          videosAnalyzed: { $ifNull: ['$videosAnalyzed', 12] }, // Default to 12 if not set
          assignmentsCompleted: { $ifNull: ['$assignmentsCompleted', 8] }, // Default to 8 if not set
          overallScore: { $ifNull: ['$overallScore', 85] }, // Default to 85 if not set
          lastActive: { $ifNull: ['$lastLoginAt', '$createdAt'] },
          licenseStatus: { $ifNull: ['$license.status', 'UNASSIGNED'] },
          licenseType: { $ifNull: ['$license.licenseType', 'STANDARD'] },
          companyName: { $ifNull: ['$corporateAccount.companyName', 'Unknown Company'] }
        }
      }
    ]);

    if (!employee || employee.length === 0) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    const employeeData = employee[0];
    
    // Convert dates to ISO strings for JSON serialization
    if (employeeData.hireDate) {
      employeeData.hireDate = new Date(employeeData.hireDate).toISOString();
    }
    if (employeeData.lastActive) {
      employeeData.lastActive = new Date(employeeData.lastActive).toISOString();
    }

    return NextResponse.json({
      success: true,
      employee: employeeData
    });

  } catch (error) {
    console.error('Error fetching employee profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
