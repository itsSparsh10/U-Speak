'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, Plus, Search, Filter, Download, Eye, Edit, Trash2, 
  MoreHorizontal, UserPlus, Settings, BarChart3, Target, X, User
} from 'lucide-react';
import { AddEmployee } from './add-employee';
import { useAdminLoginAsEmployee } from '@/hooks/use-admin-login';
import { useAuth } from '@/hooks/use-auth';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  jobTitle: string;
  customAttributes: {
    attribute1?: string;
    attribute2?: string;
    attribute3?: string;
  };
  status: 'ACTIVE' | 'DEACTIVATED';
  videosAnalyzed: number;
  assignmentsCompleted: number;
  overallScore: number;
  lastActive: Date;
  licenseStatus: 'ASSIGNED' | 'AVAILABLE' | 'EXPIRED';
}

interface FilterOptions {
  department: string;
  attribute1: string;
  attribute2: string;
  attribute3: string;
  status: string;
  scoreRange: string;
}

export function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    department: '',
    attribute1: '',
    attribute2: '',
    attribute3: '',
    status: '',
    scoreRange: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  
  const { loginAsEmployee, isLoading: isLoginLoading } = useAdminLoginAsEmployee();
  const { user } = useAuth();

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [employees, searchTerm, filters]);



  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees');
      
      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }
      
      const data = await response.json();
      
      if (data.success) {
        if (!data.employees || data.employees.length === 0) {
          setEmployees([]);
          setIsLoading(false);
          return;
        }
        
        // Transform API data to match our interface
        const transformedEmployees: Employee[] = data.employees.map((emp: any) => {
          return {
          id: emp.id,
          firstName: emp.firstName,
          lastName: emp.lastName,
          email: emp.email,
          department: emp.department || 'Unknown',
          jobTitle: emp.jobTitle || 'Unknown',
          customAttributes: {
            attribute1: emp.customAttributes?.attribute1 || '',
            attribute2: emp.customAttributes?.attribute2 || '',
            attribute3: emp.customAttributes?.attribute3 || ''
          },
            status: emp.status === true ? 'ACTIVE' : 'DEACTIVATED',
          videosAnalyzed: emp.videosAnalyzed || 0,
          assignmentsCompleted: emp.assignmentsCompleted || 0,
          overallScore: emp.overallScore || 0,
          lastActive: new Date(emp.lastActive),
          licenseStatus: emp.licenseStatus || 'ASSIGNED'
          };
        });
        
        setEmployees(transformedEmployees);
      } else {
        throw new Error(data.error || 'Failed to fetch employees');
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching employees:', error);
      // Don't set mock data, just show empty state
      setEmployees([]);
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...employees];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(emp => 
        emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Department filter
    if (filters.department) {
      filtered = filtered.filter(emp => emp.department === filters.department);
    }

    // Custom attribute filters
    if (filters.attribute1) {
      filtered = filtered.filter(emp => emp.customAttributes.attribute1 === filters.attribute1);
    }
    if (filters.attribute2) {
      filtered = filtered.filter(emp => emp.customAttributes.attribute2 === filters.attribute2);
    }
    if (filters.attribute3) {
      filtered = filtered.filter(emp => emp.customAttributes.attribute3 === filters.attribute3);
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(emp => emp.status === filters.status);
    }

    // Score range filter
    if (filters.scoreRange) {
      const [min, max] = filters.scoreRange.split('-').map(Number);
      filtered = filtered.filter(emp => emp.overallScore >= min && emp.overallScore <= max);
    }

    setFilteredEmployees(filtered);
  };

  const getUniqueValues = (field: keyof Employee | 'attribute1' | 'attribute2' | 'attribute3') => {
    if (field.startsWith('attribute')) {
      const attrKey = field as 'attribute1' | 'attribute2' | 'attribute3';
      const values: string[] = [];
      employees.forEach(emp => {
        const value = emp.customAttributes[attrKey];
        if (value && !values.includes(value)) {
          values.push(value);
        }
      });
      return values;
    }
    const values: string[] = [];
    employees.forEach(emp => {
      const value = emp[field as keyof Employee] as string;
      if (!values.includes(value)) {
        values.push(value);
      }
    });
    return values;
  };

  const exportEmployees = () => {
    const csvContent = [
      ['Name', 'Email', 'Department', 'Job Title', 'Division', 'Function', 'Role', 'Status', 'Score', 'Videos', 'Assignments'],
      ...filteredEmployees.map(emp => [
        `${emp.firstName} ${emp.lastName}`,
        emp.email,
        emp.department,
        emp.jobTitle,
        emp.customAttributes.attribute1 || '',
        emp.customAttributes.attribute2 || '',
        emp.customAttributes.attribute3 || '',
        emp.status,
        emp.overallScore.toString(),
        emp.videosAnalyzed.toString(),
        emp.assignmentsCompleted.toString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employees_export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleAdminLoginAsEmployee = async (employee: Employee) => {
    try {
      const result = await loginAsEmployee({
        employeeId: employee.id,
        employeeName: `${employee.firstName} ${employee.lastName}`
      });

      if (result.success) {
        // Show success message
        alert(`Successfully logged in as ${employee.firstName} ${employee.lastName}. Opening employee dashboard in new tab...`);
        
        // Generate a session ID for this admin login as employee
        const sessionId = `admin_emp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Create URL with session parameters (more secure than embedding full data)
        const employeeUrl = `/employee-dashboard?employeeId=${employee.id}&sessionId=${sessionId}&adminToken=${result.token}`;
        
        // Open employee dashboard in new tab
        const newTab = window.open(employeeUrl, '_blank');
        
        if (newTab) {
          setTimeout(() => {
            newTab.focus();
          }, 100);
        }
      } else {
        alert(result.error || 'Failed to login as employee');
      }
    } catch (error) {
      console.error('Error logging in as employee:', error);
      alert('Failed to login as employee. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'DEACTIVATED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLicenseStatusColor = (status: string) => {
    switch (status) {
      case 'ASSIGNED': return 'bg-blue-100 text-blue-800';
      case 'AVAILABLE': return 'bg-green-100 text-green-800';
      case 'EXPIRED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div>Loading employees...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Employee Management</h2>
          <p className="text-gray-600">Manage your team members and track their progress</p>
          {user && (
            <p className="text-sm text-gray-500 mt-1">
              Logged in as: {user.firstName} {user.lastName} ({user.role})
            </p>
          )}
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" onClick={exportEmployees}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowAddEmployee(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Add Employee
          </Button>
        </div>
      </div>

      {/* Search and Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Employees</p>
                <p className="text-xl font-bold">{employees.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-xl font-bold">{employees.filter(e => e.status === 'ACTIVE').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Avg Score</p>
                <p className="text-xl font-bold">
                  {Math.round(employees.reduce((sum, emp) => sum + emp.overallScore, 0) / employees.length)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Licenses Used</p>
                <p className="text-xl font-bold">{employees.filter(e => e.licenseStatus === 'ASSIGNED').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search employees by name, email, or department..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium">Department</Label>
                <select
                  value={filters.department}
                  onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                >
                  <option value="">All Departments</option>
                  {getUniqueValues('department').map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-sm font-medium">Division</Label>
                <select
                  value={filters.attribute1}
                  onChange={(e) => setFilters(prev => ({ ...prev, attribute1: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                >
                  <option value="">All Divisions</option>
                  {getUniqueValues('attribute1').map(div => (
                    <option key={div} value={div}>{div}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-sm font-medium">Status</Label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                >
                  <option value="">All Statuses</option>
                  <option value="ACTIVE">Active</option>
                  <option value="DEACTIVATED">Deactivated</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Employee Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Employees ({filteredEmployees.length})</span>
            <div className="text-sm text-gray-500">
              Showing {filteredEmployees.length} of {employees.length} employees
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Employee</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Department</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Division</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Performance</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">License</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr 
                    key={employee.id} 
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors group"
                    onClick={() => setSelectedEmployee(employee)}
                    title="Click anywhere on this row to view employee details"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1">
                        <div className="font-medium text-gray-900">{employee.firstName} {employee.lastName}</div>
                        <div className="text-sm text-gray-500">{employee.email}</div>
                        <div className="text-xs text-gray-400">{employee.jobTitle}</div>
                        </div>
                        <Eye className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-700">{employee.department}</td>
                    <td className="py-3 px-4 text-gray-700">{employee.customAttributes.attribute1}</td>
                    <td className="py-3 px-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{employee.overallScore}/100</span>
                          <Progress value={employee.overallScore} className="w-16 h-2" />
                        </div>
                        <div className="text-xs text-gray-500">
                          {employee.videosAnalyzed} videos • {employee.assignmentsCompleted} assignments
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={getStatusColor(employee.status)}>
                        {employee.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={getLicenseStatusColor(employee.licenseStatus)}>
                        {employee.licenseStatus}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center space-x-2" onClick={(e) => e.stopPropagation()}>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => window.open(`/employee-profile/${employee.id}`, '_blank')}
                          title="Open Profile"
                        >
                          <User className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleAdminLoginAsEmployee(employee)}
                                                      title={!user || (user.role?.toUpperCase() !== 'ADMIN' && user.role?.toUpperCase() !== 'CORPORATE_ADMIN' && user.role?.toUpperCase() !== 'CORPORATE_USER') 
                              ? 'Admin privileges required' 
                              : 'Login as Employee'}
                            className="text-blue-600 hover:text-blue-700"
                            disabled={isLoginLoading || !user || (user.role?.toUpperCase() !== 'ADMIN' && user.role?.toUpperCase() !== 'CORPORATE_ADMIN' && user.role?.toUpperCase() !== 'CORPORATE_USER')}
                        >
                          {isLoginLoading ? (
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Target className="w-4 h-4" />
                          )}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredEmployees.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {employees.length === 0 ? (
                <div>
                  <p className="text-lg font-medium mb-2">No employees found</p>
                  <p className="text-sm">The employee list is empty. This could mean:</p>
                  <ul className="text-sm mt-2 space-y-1">
                    <li>• No employees have been added yet</li>
                    <li>• The database connection failed</li>
                    <li>• There's an issue with the API</li>
                  </ul>
                  <p className="text-sm mt-2">Check the browser console for more details.</p>
                </div>
              ) : (
                'No employees found matching your criteria.'
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Employee Detail Modal */}
      {selectedEmployee && selectedEmployee.firstName && selectedEmployee.lastName && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex justify-between items-start">
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Employee Details - {selectedEmployee.firstName} {selectedEmployee.lastName}</span>
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSelectedEmployee(null)}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Quick Actions */}
              <div className="flex space-x-3 mb-6">
                <Button 
                  onClick={() => window.open(`/employee-profile/${selectedEmployee.id}`, '_blank')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <User className="w-4 h-4 mr-2" />
                  Open Full Profile
                </Button>
                <Button 
                  onClick={() => handleAdminLoginAsEmployee(selectedEmployee)}
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                                      disabled={isLoginLoading || !user || (user.role?.toUpperCase() !== 'ADMIN' && user.role?.toUpperCase() !== 'CORPORATE_ADMIN' && user.role?.toUpperCase() !== 'CORPORATE_USER')}
                >
                  {isLoginLoading ? (
                    <div className="w-4 h-4 mr-2 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Target className="w-4 h-4 mr-2" />
                  )}
                  Login as Employee
                </Button>
              </div>

              {/* Personal & Work Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 border-b pb-2">Personal Information</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">Full Name:</span>
                      <span className="text-gray-900">{selectedEmployee.firstName} {selectedEmployee.lastName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">Email:</span>
                      <span className="text-gray-900">{selectedEmployee.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">Employee ID:</span>
                      <span className="text-gray-900">EMP-{selectedEmployee.id.slice(-6)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">Status:</span>
                      <Badge className={getStatusColor(selectedEmployee.status)}>
                        {selectedEmployee.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 border-b pb-2">Work Information</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">Department:</span>
                      <span className="text-gray-900">{selectedEmployee.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">Job Title:</span>
                      <span className="text-gray-900">{selectedEmployee.jobTitle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">Division:</span>
                      <span className="text-gray-900">{selectedEmployee.customAttributes.attribute1 || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">Function:</span>
                      <span className="text-gray-900">{selectedEmployee.customAttributes.attribute2 || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">Role Level:</span>
                      <span className="text-gray-900">{selectedEmployee.customAttributes.attribute3 || 'Not specified'}</span>
                    </div>
                </div>
                </div>
                </div>

              {/* Performance Metrics */}
              <div className="border-t pt-6">
                <h4 className="font-medium text-gray-900 mb-4">Performance Metrics</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600 mb-2">{selectedEmployee.overallScore}%</div>
                    <div className="text-sm text-gray-600 mb-2">Overall Score</div>
                    <Progress value={selectedEmployee.overallScore} className="h-2" />
                </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600 mb-2">{selectedEmployee.videosAnalyzed}</div>
                    <div className="text-sm text-gray-600">Videos Analyzed</div>
                </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-3xl font-bold text-purple-600 mb-2">{selectedEmployee.assignmentsCompleted}</div>
                    <div className="text-sm text-gray-600">Assignments Completed</div>
                </div>
                </div>
              </div>
              
              {/* License Information */}
              <div className="border-t pt-6">
                <h4 className="font-medium text-gray-900 mb-4">License Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">License Status</label>
                    <Badge className={`mt-1 ${getLicenseStatusColor(selectedEmployee.licenseStatus)}`}>
                      {selectedEmployee.licenseStatus}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Features</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <Badge variant="outline" className="text-xs">Video Analysis</Badge>
                      <Badge variant="outline" className="text-xs">Learning Lessons</Badge>
                      <Badge variant="outline" className="text-xs">Progress Tracking</Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Last Active</label>
                    <p className="text-gray-900 mt-1">
                      {new Date(selectedEmployee.lastActive).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddEmployee && (
        <AddEmployee
          onClose={() => setShowAddEmployee(false)}
          onSuccess={() => {
            setShowAddEmployee(false);
            fetchEmployees(); // Refresh the employee list
          }}
        />
      )}
    </div>
  );
}
