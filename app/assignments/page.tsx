'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { CalendarIcon, PlusIcon, FilterIcon, BarChart3Icon, UsersIcon, ClockIcon, TrendingUpIcon, PieChartIcon } from 'lucide-react';
import AssignmentCharts from '@/components/assignments/assignment-charts';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { WorkReportDialog } from '@/components/assignments/work-report-dialog';
import { InstanceWorkReportDialog } from '@/components/assignments/instance-work-report-dialog';

// Simple JWT decoder (base64 decode only - no signature verification)
function decodeJWT(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

// Validate and clean MongoDB ObjectId
function cleanObjectId(id: any): string | null {
  if (!id) return null;
  
  // If it's already a clean 24-character hex string, return it
  if (typeof id === 'string' && /^[a-f0-9]{24}$/i.test(id)) {
    return id;
  }
  
  // If it's an object with _id, extract the _id
  if (typeof id === 'object' && id._id) {
    const objectId = id._id.toString();
    if (/^[a-f0-9]{24}$/i.test(objectId)) {
      return objectId;
    }
  }
  
  // If it's a string that might contain an ObjectId, try to extract it
  if (typeof id === 'string') {
    const match = id.match(/[a-f0-9]{24}/i);
    if (match) {
      return match[0];
    }
  }
  
  return null;
}

interface AssignmentMaster {
  _id: string;
  title: string;
  description: string;
  assignment_type: string;
  difficulty_level: string;
  estimated_duration?: number;
  tags?: string[];
  is_active: boolean;
}

interface AssignmentInstance {
  _id: string;
  assignment_id: AssignmentMaster;
  assignment_scope: 'INDIVIDUAL' | 'BULK';
  status: string;
  deadline?: string;
  instructions?: string;
  created_at: string;
  assigned_by_user_id: { email: string };
}

interface AssignmentEmployee {
  _id: string;
  instance_id: AssignmentInstance;
  employee_id: { first_name: string; last_name: string; department: string; job_title: string };
  status: string;
  progress_percentage: number;
  assigned_at: string;
  completed_at?: string;
  score?: number;
}

export default function AssignmentsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [assignments, setAssignments] = useState<AssignmentMaster[]>([]);
  const [instances, setInstances] = useState<AssignmentInstance[]>([]);
  const [employeeAssignments, setEmployeeAssignments] = useState<AssignmentEmployee[]>([]);
  const [overviewInstances, setOverviewInstances] = useState<AssignmentInstance[]>([]);
  const [overviewEmployeeAssignments, setOverviewEmployeeAssignments] = useState<AssignmentEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentMaster | null>(null);
  const [showWorkReportDialog, setShowWorkReportDialog] = useState(false);
  const [showInstanceWorkReportDialog, setShowInstanceWorkReportDialog] = useState(false);
  const [selectedAssignmentEmployee, setSelectedAssignmentEmployee] = useState<AssignmentEmployee | null>(null);
  const [selectedInstance, setSelectedInstance] = useState<AssignmentInstance | null>(null);
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading, token } = useAuth();

  // Try to get account ID from multiple sources
  const getAccountId = () => {
    // First try from useAuth hook
    if (user?.corporateAccountId) {
      const cleanId = cleanObjectId(user.corporateAccountId);
      if (cleanId) {
        console.log('Got clean accountId from useAuth:', cleanId);
        return cleanId;
      }
    }
    
    // Fallback: try to decode JWT token
    if (token) {
      const decoded = decodeJWT(token);
      if (decoded?.corporateAccountId) {
        console.log('Got corporateAccountId from JWT:', decoded.corporateAccountId);
        const cleanId = cleanObjectId(decoded.corporateAccountId);
        if (cleanId) {
          console.log('Got clean accountId from JWT:', cleanId);
          return cleanId;
        }
      }
    }
    
    return null;
  };

  // Get the actual account ID and user ID from the authenticated user
  const accountId = getAccountId();
  const userId = user?.id || null;

  // Debug logging to help troubleshoot
  useEffect(() => {
    if (user) {
      console.log('User data:', user);
      console.log('Account ID:', accountId);
      console.log('User ID:', userId);
      console.log('User corporateAccountId:', user.corporateAccountId);
      console.log('User id:', user.id);
    }
    
    if (token) {
      const decoded = decodeJWT(token);
      console.log('JWT decoded:', decoded);
      console.log('JWT corporateAccountId:', decoded?.corporateAccountId);
    }
    
    // Log the final extracted account ID
    console.log('Final extracted accountId:', accountId);
    console.log('Final extracted userId:', userId);
  }, [user, accountId, userId, token]);

  useEffect(() => {
    // Only fetch data if we have the required IDs and user is authenticated
    if (isAuthenticated && accountId && userId && !authLoading) {
      fetchData();
    } else if (isAuthenticated && !authLoading) {
      // Still try to fetch overview data even if account/user IDs are missing
      fetchOverviewData();
    }
  }, [isAuthenticated, accountId, userId, authLoading]);

  const fetchOverviewData = async () => {
    try {
      console.log('Fetching overview data for global statistics...');
      
      // Fetch overview data (all instances and employee assignments without filtering)
      const [overviewInstancesRes, overviewEmployeeAssignmentsRes, assignmentsRes] = await Promise.all([
        fetch(`/api/assignments/instances?all=true`), // Fetch all instances for overview section
        fetch(`/api/assignments/employees?all=true`), // Fetch all employee assignments for overview section
        fetch('/api/assignments/master') // Also fetch assignments for library count
      ]);

      console.log('Overview API responses:', {
        instances: overviewInstancesRes.status,
        employees: overviewEmployeeAssignmentsRes.status,
        assignments: assignmentsRes.status
      });

      if (overviewInstancesRes.ok) {
        const data = await overviewInstancesRes.json();
        console.log('Overview instances data:', data.data?.length, 'items');
        setOverviewInstances(data.data || []);
      }

      if (overviewEmployeeAssignmentsRes.ok) {
        const data = await overviewEmployeeAssignmentsRes.json();
        console.log('Overview employee assignments data:', data.data?.length, 'items');
        setOverviewEmployeeAssignments(data.data || []);
      }

      if (assignmentsRes.ok) {
        const data = await assignmentsRes.json();
        console.log('Assignments data:', data.data?.length, 'items');
        setAssignments(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching overview data:', error);
    }
  };

  const fetchData = async () => {
    // Don't proceed if we don't have the required IDs
    if (!accountId || !userId) {
      console.error('Missing accountId or userId for fetching assignments data');
      return;
    }

    try {
      setLoading(true);
      
      // Fetch assignments, instances (filtered by account), employee assignments (filtered by account),
      // and overview data (all instances and employee assignments without filtering)
      const [assignmentsRes, instancesRes, employeeAssignmentsRes, overviewInstancesRes, overviewEmployeeAssignmentsRes] = await Promise.all([
        fetch('/api/assignments/master'),
        fetch(`/api/assignments/instances?accountId=${accountId}`), // Filter by current user's account
        fetch(`/api/assignments/employees?accountId=${accountId}`), // Filter by current user's account
        fetch(`/api/assignments/instances?all=true`), // Fetch all instances for overview section
        fetch(`/api/assignments/employees?all=true`) // Fetch all employee assignments for overview section
      ]);

      console.log('Full data fetch API responses:', {
        assignments: assignmentsRes.status,
        instances: instancesRes.status,
        employees: employeeAssignmentsRes.status,
        overviewInstances: overviewInstancesRes.status,
        overviewEmployees: overviewEmployeeAssignmentsRes.status
      });

      if (assignmentsRes.ok) {
        const data = await assignmentsRes.json();
        console.log('Assignments data:', data.data?.length, 'items');
        setAssignments(data.data || []);
      }

      if (instancesRes.ok) {
        const data = await instancesRes.json();
        console.log('Filtered instances data:', data.data?.length, 'items');
        setInstances(data.data || []);
      }

      if (employeeAssignmentsRes.ok) {
        const data = await employeeAssignmentsRes.json();
        console.log('Filtered employee assignments data:', data.data?.length, 'items');
        setEmployeeAssignments(data.data || []);
      }

      if (overviewInstancesRes.ok) {
        const data = await overviewInstancesRes.json();
        console.log('Overview instances data:', data.data?.length, 'items');
        setOverviewInstances(data.data || []);
      }

      if (overviewEmployeeAssignmentsRes.ok) {
        const data = await overviewEmployeeAssignmentsRes.json();
        console.log('Overview employee assignments data:', data.data?.length, 'items');
        setOverviewEmployeeAssignments(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch assignments data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'OVERDUE': return 'bg-red-100 text-red-800';
      case 'ASSIGNED': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAssignmentTypeIcon = (type: string) => {
    switch (type) {
      case 'LESSON': return '📚';
      case 'VIDEO_TASK': return '🎥';
      case 'QUIZ': return '❓';
      case 'PRESENTATION': return '🎤';
      case 'ROLE_PLAY': return '🎭';
      case 'ASSESSMENT': return '📊';
      default: return '📝';
    }
  };

  // Show loading state while auth is loading or while fetching data
  if (authLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Show message if user is not authenticated
  if (!isAuthenticated) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
            <p className="text-gray-600 mb-4">Please log in to access the assignments page.</p>
            <Button onClick={() => window.location.href = '/auth'}>
              Go to Login
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show message if account ID is not available
  if (!accountId || !userId) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Account Information Missing</h1>
            <p className="text-gray-600">
              Unable to load account information. 
              {user && (
                <div className="mt-2 text-sm">
                  <p>User ID: {user.id}</p>
                  <p>Corporate Account ID: {user.corporateAccountId || 'Not available'}</p>
                  <p>Role: {user.role}</p>
                </div>
              )}
            </p>
            <p className="text-gray-500 text-sm mb-4">
              This usually happens when the user account is not properly linked to a corporate account.
            </p>
            <Button onClick={() => window.location.href = '/auth'}>
              Go to Login
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Assignments Management</h1>
            <p className="text-gray-600">Manage and track employee assignments</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button disabled={!isAuthenticated || !accountId}>
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Create Assignment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Assignment</DialogTitle>
                  <DialogDescription>
                    Create a new assignment that can be assigned to employees.
                  </DialogDescription>
                </DialogHeader>
                <CreateAssignmentForm onSuccess={() => {
                  setShowCreateDialog(false);
                  fetchData();
                }} />
              </DialogContent>
            </Dialog>
            
            <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" disabled={!isAuthenticated || !accountId || !userId}>
                  <UsersIcon className="w-4 h-4 mr-2" />
                  Assign to Employees
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Assign to Employees</DialogTitle>
                  <DialogDescription>
                    Assign an assignment to individual employees or groups.
                  </DialogDescription>
                </DialogHeader>
                <AssignToEmployeesForm 
                onSuccess={() => {
                  setShowAssignDialog(false);
                  fetchData();
                }}
                accountId={accountId || ''}
                userId={userId || ''}
              />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="assignments">Assignment Library</TabsTrigger>
            <TabsTrigger value="instances">Active Assignments</TabsTrigger>
            <TabsTrigger value="progress">Progress Tracking</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Debug Information */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-sm text-blue-800">Data Overview (Debug)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>📚 Assignment Library (Master): {assignments.length}</p>
                  <p>📋 Overview Instances: {overviewInstances.length}</p>
                  <p>👥 Overview Employee Assignments: {overviewEmployeeAssignments.length}</p>
                  <p>🏢 Filtered Instances (Account Specific): {instances.length}</p>
                  <p>👤 Filtered Employee Assignments (Account Specific): {employeeAssignments.length}</p>
                  <p>📊 Overview Employee Assignment Status: {JSON.stringify([...new Set(overviewEmployeeAssignments.map(a => a.status))])}</p>
                </div>
              </CardContent>
            </Card>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
                  <BarChart3Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{assignments.length}</div>
                  <p className="text-xs text-muted-foreground">
                    In assignment library
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  <BarChart3Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {overviewEmployeeAssignments.filter(a => a.status === 'COMPLETED').length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {overviewEmployeeAssignments.length > 0 
                      ? Math.round((overviewEmployeeAssignments.filter(a => a.status === 'COMPLETED').length / overviewEmployeeAssignments.length) * 100)
                      : 0}% completion rate
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Assigned</CardTitle>
                  <BarChart3Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {overviewEmployeeAssignments.filter(a => a.status === 'ASSIGNED').length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Ready to start
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                  <BarChart3Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {overviewEmployeeAssignments.filter(a => a.status === 'IN_PROGRESS').length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Active assignments
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                  <ClockIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {overviewEmployeeAssignments.filter(a => a.status === 'OVERDUE').length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Past deadline
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Comprehensive Charts Section */}
            <AssignmentCharts 
              assignments={assignments}
              instances={overviewInstances}
              employeeAssignments={overviewEmployeeAssignments}
            />

            {/* Recent Assignments and Department Performance Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Assignments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {overviewInstances.slice(0, 5).map((instance) => (
                      <div key={instance._id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{getAssignmentTypeIcon(instance.assignment_id?.assignment_type || 'UNKNOWN')}</span>
                          <div>
                            <p className="font-medium">{instance.assignment_id?.title || 'Unknown Assignment'}</p>
                            <p className="text-sm text-gray-600">
                              {instance.assignment_scope} • {instance.status} • 
                              Assigned by {instance.assigned_by_user_id?.email || 'Unknown'}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">{instance.assignment_id?.assignment_type || 'UNKNOWN'}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Department Performance Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Array.from(new Set(overviewEmployeeAssignments.map(a => a.employee_id?.department).filter(Boolean))).slice(0, 5).map((dept) => {
                      const deptAssignments = overviewEmployeeAssignments.filter(a => a.employee_id?.department === dept);
                      const completed = deptAssignments.filter(a => a.status === 'COMPLETED').length;
                      const total = deptAssignments.length;
                      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
                      
                      return (
                        <div key={dept} className="flex items-center justify-between">
                          <span className="font-medium">{dept}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">{percentage}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="assignments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Assignment Library</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {assignments.map((assignment) => (
                    <Card key={assignment._id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl">{getAssignmentTypeIcon(assignment.assignment_type)}</span>
                          <Badge variant={assignment.is_active ? "default" : "secondary"}>
                            {assignment.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg">{assignment.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-3">{assignment.description}</p>
                        <div className="flex items-center justify-between text-sm">
                          <Badge variant="outline">{assignment.assignment_type}</Badge>
                          <Badge variant="outline">{assignment.difficulty_level}</Badge>
                        </div>
                        {assignment.estimated_duration && (
                          <p className="text-sm text-gray-500 mt-2">
                            Estimated: {assignment.estimated_duration} minutes
                          </p>
                        )}
                        <div className="mt-3">
                          <Button 
                            size="sm" 
                            onClick={() => {
                              setSelectedAssignment(assignment);
                              setShowAssignDialog(true);
                            }}
                          >
                            Assign
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="instances" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Assignment Instances</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {instances.map((instance) => (
                    <Card key={instance._id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{getAssignmentTypeIcon(instance.assignment_id?.assignment_type || 'UNKNOWN')}</span>
                          <div>
                            <h3 className="font-semibold">{instance.assignment_id?.title || 'Unknown Assignment'}</h3>
                            <p className="text-sm text-gray-600">
                              {instance.assignment_scope} • {instance.status} • 
                              Assigned by {instance.assigned_by_user_id?.email || 'Unknown'}
                            </p>
                            {instance.deadline && (
                              <p className="text-sm text-gray-500">
                                Deadline: {new Date(instance.deadline).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(instance.status)}>
                            {instance.status}
                          </Badge>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedInstance(instance);
                              setShowInstanceWorkReportDialog(true);
                            }}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Employee Progress Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {employeeAssignments.map((assignment) => (
                    <Card key={assignment._id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {/* Safely compute initials and fallbacks when employee_id is missing */}
                          {(() => {
                            const firstName = assignment.employee_id?.first_name ?? '';
                            const lastName = assignment.employee_id?.last_name ?? '';
                            const initials = (firstName.charAt(0) || lastName.charAt(0) || '?').toUpperCase();
                            return (
                              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium">{initials}</span>
                              </div>
                            );
                          })()}

                          <div>
                            <h3 className="font-semibold">
                              {`${assignment.employee_id?.first_name ?? 'Unknown'} ${assignment.employee_id?.last_name ?? ''}`.trim()}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {assignment.employee_id?.department ?? '—'} • {assignment.employee_id?.job_title ?? '—'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {assignment.instance_id?.assignment_id?.title ?? ''}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-sm font-medium">{assignment.progress_percentage}%</p>
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${assignment.progress_percentage}%` }}
                              ></div>
                            </div>
                          </div>
                          <Badge className={getStatusColor(assignment.status)}>
                            {assignment.status}
                          </Badge>
                          {assignment.score && (
                            <Badge variant="outline">Score: {assignment.score}</Badge>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedAssignmentEmployee(assignment);
                              setShowWorkReportDialog(true);
                            }}
                          >
                            Work Reports
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Instance Work Report Dialog */}
        {selectedInstance && (
          <InstanceWorkReportDialog
            isOpen={showInstanceWorkReportDialog}
            onOpenChange={setShowInstanceWorkReportDialog}
            instance={selectedInstance}
            accountId={accountId || ''}
            userId={userId || ''}
          />
        )}
        
        {/* Work Report Dialog */}
        {selectedAssignmentEmployee && (
          <WorkReportDialog
            isOpen={showWorkReportDialog}
            onOpenChange={setShowWorkReportDialog}
            assignmentEmployee={selectedAssignmentEmployee}
            accountId={accountId || ''}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

// Create Assignment Form Component
function CreateAssignmentForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignment_type: 'LESSON',
    difficulty_level: 'BEGINNER',
    estimated_duration: '',
    tags: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/assignments/master', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          estimated_duration: formData.estimated_duration ? parseInt(formData.estimated_duration) : undefined,
          tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
        })
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Assignment created successfully'
        });
        onSuccess();
      } else {
        throw new Error('Failed to create assignment');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create assignment',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="assignment_type">Assignment Type</Label>
          <Select
            value={formData.assignment_type}
            onValueChange={(value) => setFormData({ ...formData, assignment_type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LESSON">Lesson</SelectItem>
              <SelectItem value="VIDEO_TASK">Video Task</SelectItem>
              <SelectItem value="QUIZ">Quiz</SelectItem>
              <SelectItem value="PRESENTATION">Presentation</SelectItem>
              <SelectItem value="ROLE_PLAY">Role Play</SelectItem>
              <SelectItem value="ASSESSMENT">Assessment</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="difficulty_level">Difficulty Level</Label>
          <Select
            value={formData.difficulty_level}
            onValueChange={(value) => setFormData({ ...formData, difficulty_level: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BEGINNER">Beginner</SelectItem>
              <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
              <SelectItem value="ADVANCED">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="estimated_duration">Estimated Duration (minutes)</Label>
        <Input
          id="estimated_duration"
          type="number"
          value={formData.estimated_duration}
          onChange={(e) => setFormData({ ...formData, estimated_duration: e.target.value })}
          placeholder="Optional"
        />
      </div>

      <div>
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Input
          id="tags"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          placeholder="communication, leadership, sales"
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Assignment'}
        </Button>
      </div>
    </form>
  );
}

// Assign to Employees Form Component
function AssignToEmployeesForm({ onSuccess, accountId, userId }: { 
  onSuccess: () => void;
  accountId: string;
  userId: string;
}) {
  // Don't render the form if we don't have valid IDs
  if (!accountId || !userId) {
    return (
      <div className="p-4 text-center text-gray-500">
        Please log in to assign assignments.
      </div>
    );
  }
  const [formData, setFormData] = useState({
    assignment_id: '',
    assignment_scope: 'INDIVIDUAL',
    employee_ids: [] as string[],
    filters: {
      department: '',
      job_title: '',
      customAttributes: {},
      allowAll: false
    },
    deadline: '',
    instructions: '',
    links: [] as string[]
  });
  const [assignments, setAssignments] = useState<AssignmentMaster[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [availableDepartments, setAvailableDepartments] = useState<string[]>([]);
  const [availableJobTitles, setAvailableJobTitles] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchAssignments();
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      // Fetch all employees regardless of account
      const response = await fetch(`/api/employees?method=by-account&accountId=${accountId}&all=true`);
      if (response.ok) {
        const data = await response.json();
        const employeesData = Array.isArray(data.data) ? data.data : [];
        setEmployees(employeesData);
        console.log('Fetched all employees for assignment form:', employeesData.length);
        
        // Extract unique departments and job titles for the dropdowns
        const departments = Array.from(
          new Set(employeesData.map((emp: {department?: string}) => emp.department).filter(Boolean))
        ) as string[];
        
        const jobTitles = Array.from(
          new Set(employeesData.map((emp: {jobTitle?: string}) => emp.jobTitle).filter(Boolean))
        ) as string[];
        
        setAvailableDepartments(departments);
        setAvailableJobTitles(jobTitles);
        
        console.log('Available departments:', departments);
        console.log('Available job titles:', jobTitles);
      } else {
        console.error('Failed to fetch employees:', response.status);
        setEmployees([]);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmployees([]);
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await fetch('/api/assignments/master');
      if (response.ok) {
        const data = await response.json();
        setAssignments(data.data);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Double-check that we have valid IDs before submitting
    if (!accountId || !userId) {
      toast({
        title: 'Error',
        description: 'Account information is missing. Please try logging in again.',
        variant: 'destructive'
      });
      return;
    }
    
    // Validate assignment selection
    if (!formData.assignment_id) {
      toast({
        title: 'Error',
        description: 'Please select an assignment to assign.',
        variant: 'destructive'
      });
      return;
    }
    
    // Validate that employees are selected for individual assignments
    if (formData.assignment_scope === 'INDIVIDUAL' && formData.employee_ids.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one employee for individual assignment.',
        variant: 'destructive'
      });
      return;
    }
    
    // Validate bulk assignment criteria
    if (formData.assignment_scope === 'BULK') {
      const hasDepartment = !!formData.filters.department && formData.filters.department !== '_all';
      const hasJobTitle = !!formData.filters.job_title && formData.filters.job_title !== '_all';
      const hasAllowAll = formData.filters.allowAll;
      
      if (!hasDepartment && !hasJobTitle && !hasAllowAll) {
        toast({
          title: 'Error',
          description: 'Please specify a department, job title, or enable "Assign to all employees" for bulk assignment.',
          variant: 'destructive'
        });
        return;
      }
    }
    
    setLoading(true);

    try {
      const requestBody = {
        ...formData,
        account_id: accountId,
        assigned_by_user_id: userId
      };
      
      // Process special values for bulk assignments
      if (formData.assignment_scope === 'BULK') {
        // Convert _all to empty string for API
        if (requestBody.filters.department === '_all') {
          requestBody.filters.department = '';
        }
        if (requestBody.filters.job_title === '_all') {
          requestBody.filters.job_title = '';
        }
      }
      
      const response = await fetch('/api/assignments/instances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Assignment assigned successfully'
        });
        onSuccess();
      } else {
        // Try to get more detailed error message
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to assign assignment');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to assign assignment',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="assignment_id">Assignment</Label>
        <Select
          value={formData.assignment_id}
          onValueChange={(value) => setFormData({ ...formData, assignment_id: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select an assignment" />
          </SelectTrigger>
          <SelectContent>
            {assignments.map((assignment) => (
              <SelectItem key={assignment._id} value={assignment._id}>
                {assignment.title} ({assignment.assignment_type})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="assignment_scope">Assignment Scope</Label>
        <Select
          value={formData.assignment_scope}
          onValueChange={(value) => setFormData({ ...formData, assignment_scope: value as 'INDIVIDUAL' | 'BULK' })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="INDIVIDUAL">Individual</SelectItem>
            <SelectItem value="BULK">Bulk</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {formData.assignment_scope === 'INDIVIDUAL' ? (
        <div>
          <Label htmlFor="employee_ids">Select Employees</Label>
          <div className="text-sm text-blue-600 mb-2">
            Showing all employees across all accounts
          </div>
          {employees.length === 0 ? (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
              No employees found. Please check if employees have been added.
            </div>
          ) : (
            <Select
              value=""
              onValueChange={(value) => {
                if (value && !formData.employee_ids.includes(value)) {
                  setFormData({
                    ...formData,
                    employee_ids: [...formData.employee_ids, value]
                  });
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select employees to assign" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.firstName} {employee.lastName} ({employee.department})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          {/* Display selected employees */}
          {formData.employee_ids.length > 0 && (
            <div className="mt-2 space-y-2">
              <Label>Selected Employees:</Label>
              {formData.employee_ids.map((employeeId) => {
                const employee = employees.find(emp => emp.id === employeeId);
                return (
                  <div key={employeeId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span>
                      {employee ? `${employee.firstName} ${employee.lastName}` : employeeId}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData({
                        ...formData,
                        employee_ids: formData.employee_ids.filter(id => id !== employeeId)
                      })}
                    >
                      Remove
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <Label>Bulk Assignment Filters</Label>
          
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
            Select a department and/or job title to filter employees, or choose "Assign to all employees" to include everyone.
          </div>
          
          <div className="flex items-center space-x-2 mb-4">
            <input
              type="checkbox"
              id="allowAll"
              checked={formData.filters.allowAll}
              onChange={(e) => setFormData({
                ...formData,
                filters: { ...formData.filters, allowAll: e.target.checked }
              })}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <Label htmlFor="allowAll" className="text-sm font-medium">
              Assign to all employees
            </Label>
          </div>
          
          <div>
            <Label htmlFor="department">Department</Label>
            <Select
              value={formData.filters.department}
              onValueChange={(value) => setFormData({
                ...formData,
                filters: { ...formData.filters, department: value }
              })}
              disabled={formData.filters.allowAll}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">All Departments</SelectItem>
                {availableDepartments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="job_title">Job Title</Label>
            <Select
              value={formData.filters.job_title}
              onValueChange={(value) => setFormData({
                ...formData,
                filters: { ...formData.filters, job_title: value }
              })}
              disabled={formData.filters.allowAll}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select job title" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">All Job Titles</SelectItem>
                {availableJobTitles.map((title) => (
                  <SelectItem key={title} value={title}>
                    {title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded text-sm">
            <p className="font-medium">Current Filter:</p>
            <p>
              {formData.filters.allowAll ? (
                "All employees will be included"
              ) : (
                <>
                  Department: <span className="font-medium">{formData.filters.department === '_all' ? "Any" : formData.filters.department || "Any"}</span><br />
                  Job Title: <span className="font-medium">{formData.filters.job_title === '_all' ? "Any" : formData.filters.job_title || "Any"}</span>
                </>
              )}
            </p>
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="deadline">Deadline (optional)</Label>
        <Input
          id="deadline"
          type="datetime-local"
          value={formData.deadline}
          onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
        />
      </div>

      <div>
        <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Instructions textarea (left, larger) */}
          <div className="md:col-span-2">
            <Label htmlFor="instructions" className="block mb-2">Additional Instructions (optional)</Label>
            <Textarea
              id="instructions"
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              placeholder="Any special instructions for employees..."
              className="min-h-[120px]"
            />
          </div>

          {/* Links editor (right, compact) */}
          <div className="md:col-span-1">
            <Label htmlFor="links" className="block mb-2 text-sm">Links (optional)</Label>
            <Textarea
              id="links"
              placeholder="Paste links here — one per line (http/https)"
              className="min-h-[120px] text-sm"
              onChange={(e) => {
                const text = e.target.value || '';
                // Extract lines, validate, dedupe
                const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
                const valid = lines.filter(l => /^https?:\/\//i.test(l));
                const combined = Array.from(new Set([...(formData.links || []), ...valid]));
                setFormData({ ...formData, links: combined });
              }}
            />

            {/* Render parsed links with remove buttons */}
            {formData.links && formData.links.length > 0 && (
              <div className="mt-2 space-y-2">
                {formData.links.map((link, idx) => (
                  <div key={link + idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <a href={link} target="_blank" rel="noopener noreferrer" className="truncate text-blue-600 text-sm mr-2">
                      {link}
                    </a>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newLinks = (formData.links || []).filter((_, i) => i !== idx);
                        setFormData({ ...formData, links: newLinks });
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Assigning...' : 'Assign Assignment'}
        </Button>
      </div>
    </form>
  );
}
