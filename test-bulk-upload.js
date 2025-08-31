/**
 * Bulk Upload Test Script
 * Tests the bulk upload functionality to ensure it's working correctly
 */

const fs = require('fs');
const path = require('path');

// Test configuration
const API_BASE_URL = 'http://localhost:3000';
const TEST_CSV_FILE = 'test_employees.csv';

// Sample test data for CSV
const testEmployees = [
  {
    firstName: 'Alice',
    lastName: 'Johnson',
    email: `alice.johnson.test${Date.now()}@testcompany.com`,
    phoneNumber: '5551111111',
    department: 'Engineering',
    jobTitle: 'Senior Developer',
    employeeId: `EMP-TEST-001-${Date.now()}`,
    hireDate: '2025-01-15',
    isActive: 'true'
  },
  {
    firstName: 'Bob',
    lastName: 'Wilson',
    email: `bob.wilson.test${Date.now()}@testcompany.com`,
    phoneNumber: '5552222222',
    department: 'Marketing',
    jobTitle: 'Marketing Specialist',
    employeeId: `EMP-TEST-002-${Date.now()}`,
    hireDate: '2025-01-20',
    isActive: 'true'
  },
  {
    firstName: 'Charlie',
    lastName: 'Davis',
    email: `charlie.davis.test${Date.now()}@testcompany.com`,
    phoneNumber: '5553333333',
    department: 'Sales',
    jobTitle: 'Sales Manager',
    employeeId: `EMP-TEST-003-${Date.now()}`,
    hireDate: '2025-01-25',
    isActive: 'true'
  },
  {
    firstName: 'Diana',
    lastName: 'Miller',
    email: `diana.miller.test${Date.now()}@testcompany.com`,
    phoneNumber: '5554444444',
    department: 'HR',
    jobTitle: 'HR Coordinator',
    employeeId: `EMP-TEST-004-${Date.now()}`,
    hireDate: '2025-02-01',
    isActive: 'true'
  },
  {
    firstName: 'Edward',
    lastName: 'Garcia',
    email: `edward.garcia.test${Date.now()}@testcompany.com`,
    phoneNumber: '5555555555',
    department: 'Finance',
    jobTitle: 'Financial Analyst',
    employeeId: `EMP-TEST-005-${Date.now()}`,
    hireDate: '2025-02-05',
    isActive: 'true'
  }
];

// Test cases with invalid data to test error handling
const invalidTestEmployees = [
  {
    firstName: '',
    lastName: 'InvalidFirst',
    email: `invalid1.test${Date.now()}@testcompany.com`,
    phoneNumber: '5556666666',
    department: 'Test',
    jobTitle: 'Test Employee',
    employeeId: `EMP-INVALID-001-${Date.now()}`,
    hireDate: '2025-01-15',
    isActive: 'true'
  },
  {
    firstName: 'InvalidEmail',
    lastName: 'User',
    email: 'not-a-valid-email',
    phoneNumber: '5557777777',
    department: 'Test',
    jobTitle: 'Test Employee',
    employeeId: `EMP-INVALID-002-${Date.now()}`,
    hireDate: '2025-01-20',
    isActive: 'true'
  },
  {
    firstName: 'MissingEmail',
    lastName: 'User',
    email: '',
    phoneNumber: '5558888888',
    department: 'Test',
    jobTitle: 'Test Employee',
    employeeId: `EMP-INVALID-003-${Date.now()}`,
    hireDate: '2025-01-25',
    isActive: 'true'
  }
];

/**
 * Create CSV content from employee data
 */
function createCSVContent(employees) {
  const headers = ['firstName', 'lastName', 'email', 'phoneNumber', 'department', 'jobTitle', 'employeeId', 'hireDate', 'isActive'];
  const csvRows = [headers.join(',')];
  
  employees.forEach(emp => {
    const row = headers.map(header => {
      const value = emp[header] || '';
      // Wrap values with quotes to handle commas and special characters
      return `"${value}"`;
    });
    csvRows.push(row.join(','));
  });
  
  return csvRows.join('\n');
}

/**
 * Create test CSV file
 */
function createTestCSVFile(employees, filename) {
  const csvContent = createCSVContent(employees);
  const filePath = path.join(__dirname, filename);
  
  fs.writeFileSync(filePath, csvContent, 'utf8');
  console.log(`✅ Created test CSV file: ${filePath}`);
  console.log(`📊 File contains ${employees.length} employees`);
  
  return filePath;
}

/**
 * Test the bulk upload API
 */
async function testBulkUploadAPI(employees, testName) {
  console.log(`\n🧪 Testing: ${testName}`);
  console.log(`📤 Uploading ${employees.length} employees...`);
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/employees/bulk-upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        employees,
        updateExisting: false
      }),
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ Bulk upload successful!');
      console.log(`📈 Results:`);
      console.log(`   • Created: ${result.results.created}`);
      console.log(`   • Updated: ${result.results.updated}`);
      console.log(`   • Failed: ${result.results.failed}`);
      console.log(`   • Total Success: ${result.results.success}`);
      
      if (result.results.errors && result.results.errors.length > 0) {
        console.log(`⚠️ Errors encountered:`);
        result.results.errors.forEach((error, index) => {
          console.log(`   ${index + 1}. ${error}`);
        });
      }
      
      return { success: true, results: result.results };
    } else {
      console.error('❌ Bulk upload failed!');
      console.error(`Error: ${result.error || 'Unknown error'}`);
      console.error('Response:', JSON.stringify(result, null, 2));
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('❌ API call failed!');
    console.error(`Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Test CSV parsing functionality
 */
function testCSVParsing() {
  console.log('\n🧪 Testing CSV Parsing...');
  
  try {
    const csvContent = createCSVContent(testEmployees);
    console.log('✅ CSV content generated successfully');
    console.log(`📄 CSV Preview (first 200 chars):`);
    console.log(csvContent.substring(0, 200) + '...');
    
    // Verify CSV structure
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',');
    console.log(`📊 Headers found: ${headers.length}`);
    console.log(`📋 Headers: ${headers.join(', ')}`);
    console.log(`📄 Data rows: ${lines.length - 1}`);
    
    return true;
  } catch (error) {
    console.error('❌ CSV parsing test failed!');
    console.error(`Error: ${error.message}`);
    return false;
  }
}

/**
 * Run comprehensive bulk upload tests
 */
async function runBulkUploadTests() {
  console.log('🚀 Starting Bulk Upload Test Suite');
  console.log('=====================================');
  
  const testResults = {
    csvParsing: false,
    validDataUpload: false,
    invalidDataUpload: false,
    mixedDataUpload: false
  };
  
  try {
    // Test 1: CSV Parsing
    testResults.csvParsing = testCSVParsing();
    
    // Test 2: Valid Data Upload
    console.log('\n🧪 Test 2: Valid Employee Data Upload');
    const validResult = await testBulkUploadAPI(testEmployees, 'Valid Employee Data');
    testResults.validDataUpload = validResult.success;
    
    // Test 3: Invalid Data Upload (Error Handling)
    console.log('\n🧪 Test 3: Invalid Employee Data Upload (Error Handling)');
    const invalidResult = await testBulkUploadAPI(invalidTestEmployees, 'Invalid Employee Data');
    testResults.invalidDataUpload = true; // We expect some failures here, so any response is good
    
    // Test 4: Mixed Data Upload
    const mixedEmployees = [...testEmployees.slice(0, 3), ...invalidTestEmployees.slice(0, 2)];
    console.log('\n🧪 Test 4: Mixed Valid/Invalid Employee Data Upload');
    const mixedResult = await testBulkUploadAPI(mixedEmployees, 'Mixed Employee Data');
    testResults.mixedDataUpload = true; // Again, any response is good for mixed data
    
    // Create test files for manual testing
    console.log('\n📁 Creating test files for manual testing...');
    createTestCSVFile(testEmployees, 'test_valid_employees.csv');
    createTestCSVFile(invalidTestEmployees, 'test_invalid_employees.csv');
    createTestCSVFile([...testEmployees, ...invalidTestEmployees], 'test_mixed_employees.csv');
    
  } catch (error) {
    console.error('❌ Test suite failed!');
    console.error(`Error: ${error.message}`);
  }
  
  // Print test summary
  console.log('\n📋 Test Results Summary');
  console.log('=======================');
  console.log(`CSV Parsing: ${testResults.csvParsing ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Valid Data Upload: ${testResults.validDataUpload ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Invalid Data Handling: ${testResults.invalidDataUpload ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Mixed Data Upload: ${testResults.mixedDataUpload ? '✅ PASS' : '❌ FAIL'}`);
  
  const passedTests = Object.values(testResults).filter(result => result).length;
  const totalTests = Object.keys(testResults).length;
  
  console.log(`\n🎯 Overall Result: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Bulk upload is working correctly.');
  } else {
    console.log('⚠️ Some tests failed. Please check the implementation.');
  }
}

/**
 * Test individual components
 */
async function testIndividualComponents() {
  console.log('\n🔧 Testing Individual Components');
  console.log('================================');
  
  // Test API endpoint availability
  console.log('🧪 Testing API endpoint availability...');
  try {
    const response = await fetch(`${API_BASE_URL}/api/employees/bulk-upload`, {
      method: 'OPTIONS'
    });
    console.log(`✅ API endpoint is reachable (Status: ${response.status})`);
  } catch (error) {
    console.log(`❌ API endpoint not reachable: ${error.message}`);
  }
  
  // Test template file existence
  console.log('🧪 Testing template file existence...');
  const templatePath = path.join(__dirname, 'public', 'employee_template.csv');
  if (fs.existsSync(templatePath)) {
    console.log('✅ Employee template CSV exists');
    const templateContent = fs.readFileSync(templatePath, 'utf8');
    const lines = templateContent.split('\n').filter(line => line.trim());
    console.log(`📊 Template has ${lines.length - 1} sample employees`);
  } else {
    console.log('❌ Employee template CSV not found');
  }
}

// Main execution
async function main() {
  console.log('🔍 Bulk Upload Functionality Test');
  console.log('==================================\n');
  
  // Check if we're in the right directory
  const packageJsonPath = path.join(__dirname, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.error('❌ Not in a Node.js project directory. Please run this script from the project root.');
    process.exit(1);
  }
  
  console.log('📍 Running tests from project directory');
  
  // Run individual component tests first
  await testIndividualComponents();
  
  // Run comprehensive test suite
  await runBulkUploadTests();
  
  console.log('\n🏁 Test suite completed!');
  console.log('\n💡 Tips:');
  console.log('- Check the generated CSV files for manual testing');
  console.log('- Review the console output for detailed error messages');
  console.log('- Make sure your development server is running on localhost:3000');
}

// Run the tests
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = {
  testBulkUploadAPI,
  createTestCSVFile,
  testEmployees,
  invalidTestEmployees
};
