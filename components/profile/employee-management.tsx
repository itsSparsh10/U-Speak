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
  MoreHorizontal, UserPlus, Settings, BarChart3, Target, X, User, Tag, Video, BookOpen, Clock
} from 'lucide-react';
import { AddEmployee } from './add-employee';
import { CustomAttributeManager } from './custom-attribute-manager';
import { useAdminLoginAsEmployee } from '@/hooks/use-admin-login';
import { useAuth } from '@/hooks/use-auth';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  department: string;
  jobTitle: string;
  employeeId: string;
  hireDate: string;
  status: 'ACTIVE' | 'DEACTIVATED';
  videosAnalyzed: number;
  assignmentsCompleted: number;
  overallScore: number;
  lastActive: string;
  licenseStatus: 'ASSIGNED' | 'AVAILABLE' | 'EXPIRED';
  licenseType?: string;
  companyName?: string;
  isActive: boolean;
  licenseId?: string;
  createdAt: string;
  updatedAt: string;
  customAttributes?: { [key: string]: string };
}

interface FilterOptions {
  department: string;
  status: string;
  scoreRange: string;
}

export function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    department: '',
    status: '',
    scoreRange: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showCustomAttributes, setShowCustomAttributes] = useState(false);
  const [showFullProfile, setShowFullProfile] = useState(false);
  const [fullProfileData, setFullProfileData] = useState<Employee | null>(null);
  const [showEditEmployee, setShowEditEmployee] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Employee>>({});
  
  const { loginAsEmployee, isLoading: isLoginLoading } = useAdminLoginAsEmployee();
  const { user } = useAuth();

  useEffect(() => {
    // Refetch when user (and thus corporate account) becomes available
    fetchEmployees();
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [employees, searchTerm, filters]);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      // Always fetch all employees (no account-based filtering)
      const apiUrl = '/api/employees?method=all';

      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error('Failed to fetch employees');
      const data = await response.json();

      if (!data.success) throw new Error(data.error || 'Failed to fetch employees');

      const rawEmployees = Array.isArray(data.data) ? data.data : [];
      if (rawEmployees.length === 0) {
        setEmployees([]);
        setIsLoading(false);
        return;
      }

      const transformed: Employee[] = rawEmployees.map((emp: any) => {
        const lastActiveRaw = emp.lastActive || emp.lastLoginAt || emp.created_at;
        const lastActiveDate = lastActiveRaw ? new Date(lastActiveRaw) : new Date();
        return {
          id: emp.id,
          firstName: emp.firstName || emp.first_name || 'Unknown',
          lastName: emp.lastName || emp.last_name || 'Unknown',
          email: emp.email || emp.userInfo?.userEmail || 'no-email@example.com',
          department: emp.department || 'Unknown',
          jobTitle: emp.jobTitle || emp.job_title || 'Unknown',
          status: emp.status === true || emp.status === 'ACTIVE' ? 'ACTIVE' : 'DEACTIVATED',
          videosAnalyzed: emp.videosAnalyzed || 0,
          assignmentsCompleted: emp.assignmentsCompleted || 0,
          overallScore: emp.overallScore || 0,
          lastActive: isNaN(lastActiveDate.getTime()) ? new Date() : lastActiveDate,
          licenseStatus: emp.licenseStatus || 'ASSIGNED',
          customAttributes: emp.customAttributes || {}
        };
      });

      const withAttributes = await Promise.all(
        transformed.map(async (emp) => {
          try {
            const attrRes = await fetch(`/api/employee-attribute-values?employeeId=${emp.id}`);
            if (attrRes.ok) {
              const attrData = await attrRes.json();
              if (attrData.success && Array.isArray(attrData.attribute_values)) {
                const customAttributes: { [k: string]: string } = {};
                attrData.attribute_values.forEach((v: any) => {
                  customAttributes[`position_${v.attribute_position}`] = v.value;
                });
                emp.customAttributes = customAttributes;
              }
            }
          } catch (e) {
            console.error('Attribute fetch failed for employee', emp.id, e);
          }
          return emp;
        })
      );

      setEmployees(withAttributes);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setEmployees([]);
    } finally {
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

  const getUniqueValues = (field: keyof Employee) => {
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
      ['Name', 'Email', 'Department', 'Job Title', 'Status', 'Score', 'Videos', 'Assignments'],
      ...filteredEmployees.map(emp => [
        `${emp.firstName} ${emp.lastName}`,
        emp.email,
        emp.department,
        emp.jobTitle,
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

  const handleOpenFullProfile = async (employee: Employee) => {
    try {
      // Fetch detailed employee profile data
      const response = await fetch(`/api/employees/${employee.id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setFullProfileData(data.employee);
          setShowFullProfile(true);
        } else {
          alert('Failed to fetch employee profile data');
        }
      } else {
        alert('Failed to fetch employee profile data');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      alert('Failed to fetch employee profile data');
    }
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setEditFormData({
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phoneNumber: employee.phoneNumber || '',
      department: employee.department,
      jobTitle: employee.jobTitle,
      status: employee.status,
      licenseStatus: employee.licenseStatus,
    });
    setShowEditEmployee(true);
  };

  const handleSaveEmployee = async () => {
    if (!editingEmployee) return;

    try {
      // Get authentication token from localStorage
      const token = localStorage.getItem('uspeak_token');
      
      const response = await fetch(`/api/employees/${editingEmployee.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(editFormData),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          alert('Employee updated successfully');
          setShowEditEmployee(false);
          setEditingEmployee(null);
          fetchEmployees(); // Refresh the employee list
        } else {
          alert('Failed to update employee: ' + data.error);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert('Failed to update employee: ' + (errorData.error || `HTTP ${response.status}`));
      }
    } catch (error) {
      console.error('Error updating employee:', error);
      alert('Failed to update employee');
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
              <div>
                <Label className="text-sm font-medium">Score Range</Label>
                <select
                  value={filters.scoreRange}
                  onChange={(e) => setFilters(prev => ({ ...prev, scoreRange: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                >
                  <option value="">All Scores</option>
                  <option value="0-25">0-25%</option>
                  <option value="26-50">26-50%</option>
                  <option value="51-75">51-75%</option>
                  <option value="76-100">76-100%</option>
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
                          onClick={() => handleEditEmployee(employee)}
                          disabled={!user || (user.role?.toUpperCase() !== 'ADMIN' && user.role?.toUpperCase() !== 'CORPORATE_ADMIN')}
                          title={!user || (user.role?.toUpperCase() !== 'ADMIN' && user.role?.toUpperCase() !== 'CORPORATE_ADMIN') 
                            ? 'Admin privileges required to edit employees' 
                            : 'Edit employee details'}
                        >
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
                  onClick={() => selectedEmployee && handleOpenFullProfile(selectedEmployee)}
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  View Full Profile
                </Button>
                {/* 
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
                */}
                <Button 
                  onClick={() => setShowCustomAttributes(true)}
                  variant="outline"
                  className="border-green-600 text-green-600 hover:bg-green-50"
                >
                  <Tag className="w-4 h-4 mr-2" />
                  Custom Attributes
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
                </div>
                </div>
                </div>

              {/* Custom Attributes Section */}
              {selectedEmployee.customAttributes && Object.keys(selectedEmployee.customAttributes).length > 0 && (
                <div className="border-t pt-6">
                  <h4 className="font-medium text-gray-900 mb-4">Custom Attributes</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(selectedEmployee.customAttributes || {}).map(([key, value]) => {
                      const position = key.replace('position_', '');
                      return value ? (
                        <div key={key} className="p-3 bg-gray-50 rounded-lg">
                          <label className="text-sm font-medium text-gray-700">Position {position}</label>
                          <p className="text-gray-900 mt-1">{value}</p>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

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

      {/* Custom Attribute Manager Modal */}
      {showCustomAttributes && selectedEmployee && (
        <CustomAttributeManager
          employee={selectedEmployee}
          onClose={() => setShowCustomAttributes(false)}
          onUpdate={() => {
            setShowCustomAttributes(false);
            fetchEmployees(); // Refresh the employee list
          }}
        />
      )}

      {/* Full Profile Modal */}
      {showFullProfile && fullProfileData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto bg-white rounded-lg">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {fullProfileData.firstName} {fullProfileData.lastName}
                  </h2>
                  <p className="text-gray-600">{fullProfileData.jobTitle} • {fullProfileData.department}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowFullProfile(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Target className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Overall Score</p>
                        <p className="text-xl font-bold">{fullProfileData.overallScore}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Video className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-600">Videos Analyzed</p>
                        <p className="text-xl font-bold">{fullProfileData.videosAnalyzed}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="text-sm text-gray-600">Assignments</p>
                        <p className="text-xl font-bold">{fullProfileData.assignmentsCompleted}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-orange-600" />
                      <div>
                        <p className="text-sm text-gray-600">Last Active</p>
                        <p className="text-sm font-medium">
                          {new Date(fullProfileData.lastActive).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Personal & Work Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 border-b pb-2">Personal Information</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">Full Name:</span>
                      <span className="text-gray-900">{fullProfileData.firstName} {fullProfileData.lastName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">Email:</span>
                      <span className="text-gray-900">{fullProfileData.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">Phone:</span>
                      <span className="text-gray-900">{fullProfileData.phoneNumber || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">Employee ID:</span>
                      <span className="text-gray-900">{fullProfileData.employeeId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">Hire Date:</span>
                      <span className="text-gray-900">{new Date(fullProfileData.hireDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 border-b pb-2">Work Information</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">Department:</span>
                      <span className="text-gray-900">{fullProfileData.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">Job Title:</span>
                      <span className="text-gray-900">{fullProfileData.jobTitle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">Status:</span>
                      <Badge className={getStatusColor(fullProfileData.status)}>
                        {fullProfileData.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* License Information */}
              <div className="border-t pt-6">
                <h4 className="font-medium text-gray-900 mb-4">License Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">License Status</label>
                    <Badge className={`mt-1 ${getLicenseStatusColor(fullProfileData.licenseStatus)}`}>
                      {fullProfileData.licenseStatus}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">License Type</label>
                    <p className="text-gray-900 mt-1">{fullProfileData.licenseType || 'Standard'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Features</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <Badge variant="outline" className="text-xs">Video Analysis</Badge>
                      <Badge variant="outline" className="text-xs">Learning Lessons</Badge>
                      <Badge variant="outline" className="text-xs">Progress Tracking</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditEmployee && editingEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex justify-between items-start">
              <CardTitle className="flex items-center space-x-2">
                <Edit className="w-5 h-5" />
                <span>Edit Employee - {editingEmployee.firstName} {editingEmployee.lastName}</span>
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowEditEmployee(false)}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={editFormData.firstName || ''}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={editFormData.lastName || ''}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editFormData.email || ''}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={editFormData.phoneNumber || ''}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={editFormData.department || ''}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, department: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input
                    id="jobTitle"
                    value={editFormData.jobTitle || ''}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={editFormData.status || ''}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, status: e.target.value as 'ACTIVE' | 'DEACTIVATED' }))}
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="DEACTIVATED">Deactivated</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="licenseStatus">License Status</Label>
                  <select
                    id="licenseStatus"
                    value={editFormData.licenseStatus || ''}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, licenseStatus: e.target.value as 'ASSIGNED' | 'AVAILABLE' | 'EXPIRED' }))}
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                  >
                    <option value="ASSIGNED">Assigned</option>
                    <option value="AVAILABLE">Available</option>
                    <option value="EXPIRED">Expired</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="outline" onClick={() => setShowEditEmployee(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEmployee}>
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
