import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { EmployeeProfile, CustomAttributeDefinition, EmployeeAttributeValue } from '@/lib/models';
import mongoose from 'mongoose';

// GET - Fetch all attribute values for a specific employee
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    
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

    // Check if employee exists
    const employee = await EmployeeProfile.findById(employeeId);
    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Fetch all attribute values for the employee with populated attribute definitions
    const attributeValues = await EmployeeAttributeValue.aggregate([
      {
        $match: {
          employee_id: new mongoose.Types.ObjectId(employeeId)
        }
      },
      {
        $lookup: {
          from: 'customattributedefinitions',
          localField: 'attribute_id',
          foreignField: '_id',
          as: 'attribute_definition'
        }
      },
      {
        $unwind: '$attribute_definition'
      },
      {
        $project: {
          _id: 1,
          employee_id: 1,
          attribute_id: 1,
          value: 1,
          created_at: 1,
          updated_at: 1,
          attribute_name: '$attribute_definition.name',
          attribute_position: '$attribute_definition.position'
        }
      },
      {
        $sort: {
          'attribute_position': 1
        }
      }
    ]);

    return NextResponse.json({
      success: true,
      employee_id: employeeId,
      attribute_values: attributeValues
    });

  } catch (error) {
    console.error('Error fetching employee attribute values:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create or update attribute values for an employee
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { employeeId, attributeValues } = body;

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

    if (!Array.isArray(attributeValues)) {
      return NextResponse.json(
        { error: 'Attribute values must be an array' },
        { status: 400 }
      );
    }

    // Check if employee exists
    const employee = await EmployeeProfile.findById(employeeId);
    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    const results = [];
    const errors = [];

    // Process each attribute value
    for (const attrValue of attributeValues) {
      const { attributeId, value } = attrValue;

      if (!attributeId) {
        errors.push('Attribute ID is required for each value');
        continue;
      }

      if (!mongoose.Types.ObjectId.isValid(attributeId)) {
        errors.push(`Invalid attribute ID format: ${attributeId}`);
        continue;
      }

      try {
        // Check if attribute definition exists
        const attributeDefinition = await CustomAttributeDefinition.findById(attributeId);
        if (!attributeDefinition || !attributeDefinition.is_active) {
          errors.push(`Attribute definition not found or inactive: ${attributeId}`);
          continue;
        }

        // Find existing value or create new one
        let employeeAttributeValue = await EmployeeAttributeValue.findOne({
          employee_id: employeeId,
          attribute_id: attributeId
        });

        if (employeeAttributeValue) {
          // Update existing value
          employeeAttributeValue.value = value || '';
          await employeeAttributeValue.save();
          results.push({
            action: 'updated',
            employee_id: employeeId,
            attribute_id: attributeId,
            attribute_name: attributeDefinition.name,
            value: employeeAttributeValue.value,
            _id: employeeAttributeValue._id
          });
        } else {
          // Create new value
          employeeAttributeValue = await EmployeeAttributeValue.create({
            employee_id: employeeId,
            attribute_id: attributeId,
            value: value || ''
          });
          results.push({
            action: 'created',
            employee_id: employeeId,
            attribute_id: attributeId,
            attribute_name: attributeDefinition.name,
            value: employeeAttributeValue.value,
            _id: employeeAttributeValue._id
          });
        }
      } catch (error: any) {
        errors.push(`Error processing attribute ${attributeId}: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${results.length} attribute values`,
      results,
      errors
    });

  } catch (error) {
    console.error('Error updating employee attribute values:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a specific attribute value
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const valueId = searchParams.get('valueId');
    const employeeId = searchParams.get('employeeId');
    const attributeId = searchParams.get('attributeId');
    
    if (valueId) {
      // Delete by value ID
      if (!mongoose.Types.ObjectId.isValid(valueId)) {
        return NextResponse.json(
          { error: 'Invalid value ID format' },
          { status: 400 }
        );
      }

      const deletedValue = await EmployeeAttributeValue.findByIdAndDelete(valueId);
      if (!deletedValue) {
        return NextResponse.json(
          { error: 'Attribute value not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Attribute value deleted successfully',
        deleted_value: deletedValue
      });
    } else if (employeeId && attributeId) {
      // Delete by employee ID and attribute ID
      if (!mongoose.Types.ObjectId.isValid(employeeId) || !mongoose.Types.ObjectId.isValid(attributeId)) {
        return NextResponse.json(
          { error: 'Invalid employee ID or attribute ID format' },
          { status: 400 }
        );
      }

      const deletedValue = await EmployeeAttributeValue.findOneAndDelete({
        employee_id: employeeId,
        attribute_id: attributeId
      });

      if (!deletedValue) {
        return NextResponse.json(
          { error: 'Attribute value not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Attribute value deleted successfully',
        deleted_value: deletedValue
      });
    } else {
      return NextResponse.json(
        { error: 'Either valueId or both employeeId and attributeId are required' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error deleting employee attribute value:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
