import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { EmployeeProfile } from '@/lib/models';
import mongoose from 'mongoose';

// POST - Update employee custom attribute values
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { employeeId, customAttributes } = body;

    if (!employeeId) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return NextResponse.json(
        { error: 'Invalid employee ID format' },
        { status: 400 }
      );
    }

    if (!customAttributes || typeof customAttributes !== 'object') {
      return NextResponse.json(
        { error: 'Custom attributes object is required' },
        { status: 400 }
      );
    }

    // Find the employee profile
    const employee = await EmployeeProfile.findById(employeeId);
    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Create custom attributes object - store as simple key-value pairs
    const customAttributeValues: { [key: string]: string } = {};
    
    // Handle position-based custom attributes (position_1, position_2, position_3)
    ['position_1', 'position_2', 'position_3'].forEach(key => {
      if (customAttributes[key] !== undefined) {
        customAttributeValues[key] = String(customAttributes[key]).trim();
      }
    });

    // Update the employee's custom attributes
    employee.custom_attributes = customAttributeValues;
    await employee.save();

    return NextResponse.json({
      success: true,
      message: 'Employee custom attributes updated successfully',
      employee: {
        id: employee._id,
        firstName: employee.first_name,
        lastName: employee.last_name,
        customAttributes: employee.custom_attributes
      }
    });

  } catch (error) {
    console.error('Error updating employee custom attributes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
