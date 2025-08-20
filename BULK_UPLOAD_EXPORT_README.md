# Bulk Upload and Export Functionality

## Overview
This document describes the enhanced Quick Actions section that provides bulk CSV upload and export capabilities for employee management.

## Features

### 🚀 Bulk Upload
- **CSV Import**: Upload CSV files with employee data
- **Field Mapping**: Intelligent mapping of CSV columns to employee attributes
- **Update Existing**: Option to update existing employees or create new ones
- **Validation**: Comprehensive data validation before import
- **Error Handling**: Detailed feedback on successful and failed imports

### 📊 Export Report
- **One-Click Export**: Download all employee data with a single click
- **Complete Data**: Includes all fields from the database
- **CSV Format**: Standard CSV format for easy analysis
- **Timestamped**: Files are automatically named with current date

## Quick Actions Section

The Quick Actions section is located in the Profile page and contains three main buttons:

1. **Bulk Upload** - Opens the CSV upload modal
2. **Export Report** - Downloads all employee data
3. **Company Settings** - Navigates to company settings tab

## CSV Format

### Required Fields
- `firstName` - Employee's first name
- `lastName` - Employee's last name  
- `email` - Employee's email address (must be unique)

### Optional Fields
- `phoneNumber` - Phone number
- `department` - Department name
- `jobTitle` - Job title/position
- `attribute1Value` - Custom attribute 1 (e.g., Division)
- `attribute2Value` - Custom attribute 2 (e.g., Function)
- `attribute3Value` - Custom attribute 3 (e.g., Level)
- `employeeId` - Custom employee ID
- `hireDate` - Date of hire (YYYY-MM-DD format)
- `isActive` - Active status (true/false)

### Example CSV
```csv
firstName,lastName,email,phoneNumber,department,jobTitle,attribute1Value,attribute2Value,attribute3Value,employeeId,hireDate,isActive
John,Doe,john.doe@company.com,5551234567,Sales,Sales Representative,North Division,Field Sales,Senior,EMP-001,2025-01-15,true
Jane,Smith,jane.smith@company.com,5559876543,Marketing,Marketing Manager,East Division,Digital Marketing,Manager,EMP-002,2025-01-20,true
```

## How to Use

### Bulk Upload Process

1. **Click "Bulk Upload"** in the Quick Actions section
2. **Upload CSV File**: Drag and drop or browse for your CSV file
3. **Map Fields**: Map CSV columns to employee attributes
4. **Review Data**: Preview the data before upload
5. **Choose Update Mode**: 
   - Unchecked: Only create new employees
   - Checked: Update existing employees if email matches
6. **Upload**: Click "Upload Employees" to process

### Export Process

1. **Click "Export Report"** in the Quick Actions section
2. **Wait for Processing**: System generates the export
3. **Download**: File automatically downloads as CSV
4. **File Naming**: Format: `employees_export_YYYY-MM-DD.csv`

## API Endpoints

### Bulk Upload
- **Endpoint**: `POST /api/employees/bulk-upload`
- **Purpose**: Process CSV data and create/update employees
- **Parameters**:
  - `employees`: Array of employee objects
  - `updateExisting`: Boolean to update existing employees

### Export
- **Endpoint**: `GET /api/employees/export`
- **Purpose**: Download all employee data as CSV
- **Response**: CSV file with proper headers

## Database Schema

The system handles the following employee fields:

```typescript
interface Employee {
  _id: string;
  corporateAccountId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  department: string;
  jobTitle: string;
  customAttributes: {
    attribute1Value: string;
    attribute2Value: string;
    attribute3Value: string;
  };
  employeeId: string;
  hireDate: Date;
  isActive: boolean;
  licenseId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## Error Handling

### Upload Errors
- **Missing Required Fields**: firstName, lastName, or email
- **Duplicate Emails**: When updateExisting is false
- **Invalid Data**: Malformed dates, invalid boolean values
- **Database Errors**: Connection issues, validation failures

### Export Errors
- **No Employees**: When no active employees exist
- **Database Connection**: Connection failures
- **File Generation**: CSV creation errors

## Best Practices

### CSV Preparation
1. **Use Template**: Download and use the provided template
2. **Validate Data**: Ensure all required fields are filled
3. **Check Format**: Verify date formats (YYYY-MM-DD)
4. **Unique Emails**: Ensure email addresses are unique
5. **Test Small**: Test with a small dataset first

### Upload Strategy
1. **Backup First**: Export existing data before bulk upload
2. **Update Mode**: Use update mode for existing employees
3. **Review Results**: Check upload results for any errors
4. **Verify Data**: Confirm data was imported correctly

### Export Strategy
1. **Regular Exports**: Export data regularly for backup
2. **Filter First**: Use filters in the employee list if needed
3. **Check Format**: Verify CSV opens correctly in your tools
4. **Archive**: Keep historical exports for record keeping

## Troubleshooting

### Common Issues

**Upload Fails**
- Check CSV format and required fields
- Verify email addresses are unique
- Ensure proper date format
- Check file size (max 5MB)

**Export Fails**
- Verify database connection
- Check if employees exist
- Ensure proper permissions

**Field Mapping Issues**
- Download template for correct format
- Check CSV headers match expected fields
- Verify no extra spaces in headers

### Support

For technical issues:
1. Check browser console for errors
2. Verify CSV format matches template
3. Ensure all required fields are mapped
4. Check network connectivity

## Security Features

- **Authentication Required**: All operations require valid admin session
- **Input Validation**: Server-side validation of all data
- **Audit Logging**: All operations are logged for compliance
- **Data Sanitization**: Proper handling of special characters
- **Rate Limiting**: Protection against abuse

## Performance Considerations

- **Batch Processing**: Large uploads are processed in batches
- **Progress Tracking**: Real-time feedback during upload
- **Memory Management**: Efficient handling of large CSV files
- **Database Optimization**: Optimized queries for bulk operations

## Future Enhancements

- **Excel Support**: Direct Excel file upload
- **Advanced Validation**: Custom validation rules
- **Bulk Operations**: Delete, deactivate multiple employees
- **Scheduled Exports**: Automated export scheduling
- **Data Transformation**: Advanced data mapping options
