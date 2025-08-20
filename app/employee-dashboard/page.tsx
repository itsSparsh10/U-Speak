'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, Camera, Save, TrendingUp, Video, BookOpen, Award, Target, BarChart3, 
  Users, Upload, FileText, Settings, Building, CreditCard, Bell, Plus,
  Download, Filter, Eye, Edit, Trash2, CheckCircle, AlertCircle, X, Calendar, Star, Flame
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

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
}

interface CorporateStats {
  totalEmployees: number;
  activeEmployees: number;
  totalVideos: number;
  averageScore: number;
  licensesAssigned: number;
  licensesAvailable: number;
}

export default function EmployeeDashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('daily-reports');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [corporateStats, setCorporateStats] = useState<CorporateStats>({
    totalEmployees: 0,
    activeEmployees: 0,
    totalVideos: 0,
    averageScore: 0,
    licensesAssigned: 0,
    licensesAvailable: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showCSVUpload, setShowCSVUpload] = useState(false);
  const [showProfileDetails, setShowProfileDetails] = useState(false);
  
  // Check if we're logged in as an employee (admin login as employee)
  const [isLoggedInAsEmployee, setIsLoggedInAsEmployee] = useState(false);
  const [employeeUserData, setEmployeeUserData] = useState<any>(null);
  const [employeeId, setEmployeeId] = useState<string | null>(null);

  // Employee-specific state
  const [dailyReports, setDailyReports] = useState<any[]>([]);
  const [employeeStats, setEmployeeStats] = useState<any>({
    totalVideosAnalyzed: 0,
    averageScore: 0,
    assignmentsCompleted: 0,
    streakDays: 0,
    lastActive: new Date(),
    overallRating: 0
  });

  // Check for employee session on mount (support both direct login and admin login as employee)
  useEffect(() => {
    // Skip if not on client side
    if (typeof window === 'undefined') return;
    
    // Get URL parameters to check for admin login as employee
    const urlParams = new URLSearchParams(window.location.search);
    const employeeIdParam = urlParams.get('employeeId');
    const sessionIdParam = urlParams.get('sessionId');
    const adminTokenParam = urlParams.get('adminToken');
    
    if (employeeIdParam && sessionIdParam && adminTokenParam) {
      // Admin login as employee - fetch employee data directly
      console.log('Admin login as employee detected, fetching employee data...');
      
      const fetchEmployeeData = async () => {
        try {
          // Use existing employee API
          const response = await fetch(`/api/employees/${employeeIdParam}`);
          
          if (!response.ok) {
            throw new Error('Failed to fetch employee data');
          }
          
          const result = await response.json();
          
          if (result.success && result.employee) {
            console.log('Admin login as employee - employee data loaded:', result.employee);
            setIsLoggedInAsEmployee(true);
            setEmployeeUserData(result.employee);
            setEmployeeId(result.employee.id);
            
            // Set employee stats from MongoDB data
            setEmployeeStats({
              totalVideosAnalyzed: result.employee.videosAnalyzed || 12,
              averageScore: result.employee.overallScore || 85,
              assignmentsCompleted: result.employee.assignmentsCompleted || 8,
              streakDays: 5,
              lastActive: new Date(),
              overallRating: 4.2
            });
            
            // Clean up URL parameters after processing
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
          } else {
            throw new Error('Invalid employee data');
          }
        } catch (error) {
          console.error('Error fetching employee data:', error);
          toast({
            title: 'Session Error',
            description: 'Failed to load employee data. Please try logging in again.',
            variant: 'destructive'
          });
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchEmployeeData();
    } else if (user && user.role !== 'ADMIN' && user.role !== 'CORPORATE_ADMIN') {
      // Direct employee login - use auth context user data
      console.log('Direct employee login detected:', user);
      setIsLoggedInAsEmployee(false); // This is direct login, not admin login as employee
      setEmployeeUserData(user);
      setEmployeeId(user.id);
      
      // Set employee stats for direct login
      setEmployeeStats({
        totalVideosAnalyzed: 12,
        averageScore: 85,
        assignmentsCompleted: 8,
        streakDays: 5,
        lastActive: new Date(),
        overallRating: 4.2
      });
      
      setIsLoading(false);
    } else {
      // No employee session and not an employee user
      setIsLoading(false);
    }
  }, [user, toast]);

  // Initialize with default values for UI display
  useEffect(() => {
    if (user && user.role !== 'ADMIN' && !isLoggedInAsEmployee) {
      // Set default values for employee stats (for UI display only)
      setEmployeeStats({
        totalVideosAnalyzed: 12,
        averageScore: 85,
        assignmentsCompleted: 8,
        streakDays: 5,
        lastActive: new Date(),
        overallRating: 4.2
      });
      
      // Set default daily reports (for UI display only)
      setDailyReports([
        {
          id: '1',
          date: new Date(),
          tasksCompleted: ['Video analysis completed', 'Communication skills practice', 'Team meeting attended'],
          hoursWorked: 8,
          challenges: ['Had difficulty with public speaking exercise'],
          nextDayPlan: ['Continue with advanced modules', 'Practice elevator pitch'],
          mood: 'good',
          submitted: true
        },
        {
          id: '2',
          date: new Date(Date.now() - 86400000), // Yesterday
          tasksCompleted: ['Completed confidence module', 'Recorded practice video'],
          hoursWorked: 7.5,
          challenges: ['Time management was challenging'],
          nextDayPlan: ['Start new module', 'Review feedback'],
          mood: 'excellent',
          submitted: true
        }
      ]);
    }
  }, [user, isLoggedInAsEmployee]);

  // Local controlled state for profile form
  const [firstNameInput, setFirstNameInput] = useState<string>(user?.firstName || '');
  const [lastNameInput, setLastNameInput] = useState<string>(user?.lastName || '');
  const [emailInput, setEmailInput] = useState<string>(user?.email || '');
  const [phoneInput, setPhoneInput] = useState<string>('');
  const [departmentInput, setDepartmentInput] = useState<string>(user?.department || '');
  const [jobTitleInput, setJobTitleInput] = useState<string>(user?.jobTitle || '');

  const fetchEmployeeDataFromMongoDB = async (id: string) => {
    try {
      console.log('fetchEmployeeDataFromMongoDB - Starting for employee:', id);
      const response = await fetch(`/api/employees/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch employee data from MongoDB');
      }
      
      const data = await response.json();
      console.log('MongoDB response:', data);
      
      if (data.success && data.employee) {
        // Set fresh employee data from MongoDB
        setEmployeeStats({
          totalVideosAnalyzed: data.employee.videosAnalyzed || 12,
          averageScore: data.employee.overallScore || 85,
          assignmentsCompleted: data.employee.assignmentsCompleted || 8,
          streakDays: 5, // Default value
          lastActive: new Date(data.employee.lastActive || new Date()),
          overallRating: 4.2 // Default value
        });
        
        // Also update the employee user data with fresh info
        if (employeeUserData) {
          const updatedEmployeeData = {
            ...employeeUserData,
            videosAnalyzed: data.employee.videosAnalyzed || 12,
            overallScore: data.employee.overallScore || 85,
            assignmentsCompleted: data.employee.assignmentsCompleted || 8,
            jobTitle: data.employee.jobTitle || employeeUserData.jobTitle,
            department: data.employee.department || employeeUserData.department
          };
          setEmployeeUserData(updatedEmployeeData);
        }
      } else {
        throw new Error(data.error || 'Failed to fetch employee data from MongoDB');
      }
    } catch (error) {
      console.error('Error fetching employee data from MongoDB:', error);
      toast({
        title: 'Error',
        description: 'Failed to load employee data from database',
        variant: 'destructive'
      });
    }
  };

  // Allow access if authenticated (either direct employee login or admin login as employee)
  if (!isAuthenticated) {
    return <div>Please log in to access the employee dashboard.</div>;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading employee dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section with Integrated Profile */}
        <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl overflow-hidden mb-8 shadow-2xl">
          {/* Enhanced Background Patterns */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-48 h-48 bg-white/5 transform rotate-45 -translate-x-24 -translate-y-24 rounded-full"></div>
            <div className="absolute top-16 right-0 w-40 h-40 bg-white/5 transform rotate-45 translate-x-20 -translate-y-20 rounded-full"></div>
            <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-white/5 transform rotate-45 translate-y-16 rounded-full"></div>
            <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-white/3 transform rotate-12"></div>
          </div>
          
          <div className="relative p-8 md:p-10">
            {/* Integrated Title and Profile Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                    Welcome back, {employeeUserData?.firstName || user?.firstName || 'Employee'}!
                  </h1>
                  <p className="text-blue-200 text-sm">
                    {employeeUserData?.email || user?.email || 'employee@company.com'}
                  </p>
                </div>
              </div>

              {/* Profile Picture and Action Buttons */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="bg-white/20 border-white/30 text-white hover:bg-white/30 text-xs px-3 py-1.5"
                    onClick={() => {
                      toast({
                        title: '📸 Photo Upload',
                        description: 'Photo upload feature coming soon!',
                        variant: 'info'
                      });
                    }}
                  >
                    <Camera className="w-3 h-3 mr-1.5" />
                    Change Photo
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="bg-white/20 border-white/30 text-white hover:bg-white/30 text-xs px-3 py-1.5"
                    onClick={() => setShowProfileDetails(!showProfileDetails)}
                  >
                    {showProfileDetails ? 'Hide Details' : 'Show Details'}
                  </Button>
                </div>
                

              </div>
            </div>

            {/* Expandable Details */}
            {showProfileDetails && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex justify-between items-center p-3 bg-white/10 rounded border border-white/20 h-16">
                    <span className="text-sm text-blue-100">Videos Analyzed</span>
                    <span className="text-white font-bold">{employeeStats.totalVideosAnalyzed}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/10 rounded border border-white/20 h-16">
                    <span className="text-sm text-blue-100">Average Score</span>
                    <span className="text-white font-bold">{employeeStats.averageScore}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/10 rounded border border-white/20 h-16">
                    <span className="text-sm text-blue-100">Assignments</span>
                    <span className="text-white font-bold">{employeeStats.assignmentsCompleted}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/10 rounded border border-white/20 h-16">
                    <span className="text-sm text-blue-100">Notifications</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="bg-white/20 border-white/30 text-white hover:bg-white/30 text-xs px-2 py-1"
                      onClick={() => {
                        toast({
                          title: '🔔 Notifications',
                          description: 'Notification settings coming soon!',
                          variant: 'info'
                        });
                      }}
                    >
                      <Bell className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
          </div>

                {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-4 md:gap-6">
          {/* Main Content Area - Full Width */}
          <div className="w-full">
            <Card className="bg-white shadow-xl border-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex flex-col space-y-1.5 p-4 md:p-6 border-b border-gray-100">
                  <TabsList className="h-9 md:h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground grid w-full grid-cols-5">
                    <TabsTrigger value="daily-reports" className="text-xs md:text-sm">Daily Reports</TabsTrigger>
                    <TabsTrigger value="progress" className="text-xs md:text-sm">Progress</TabsTrigger>
                    <TabsTrigger value="assignments" className="text-xs md:text-sm">Assignments</TabsTrigger>
                    <TabsTrigger value="feedback" className="text-xs md:text-sm">Feedback</TabsTrigger>
                    <TabsTrigger value="learning" className="text-xs md:text-sm">Learning</TabsTrigger>
                  </TabsList>
                </div>
                <div className="p-4 md:p-8">
                  <TabsContent value="daily-reports" className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Daily Work Reports</h3>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        + New Report
                      </Button>
                    </div>

                    {/* Daily Reports List */}
                    <div className="space-y-4">
                  {dailyReports.map((report) => (
                    <Card key={report.id} className="bg-white shadow-sm border border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="font-medium text-gray-900">
                              {report.date.toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <Badge className="bg-green-100 text-green-800">
                              {report.submitted ? 'Submitted' : 'Draft'}
                            </Badge>
                            <Badge className="bg-blue-100 text-blue-800">
                              {report.hoursWorked}h worked
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Tasks Completed</h4>
                            <ul className="space-y-1">
                              {report.tasksCompleted.map((task: string, index: number) => (
                                <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                  <span>{task}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Challenges Faced</h4>
                            <ul className="space-y-1">
                              {report.challenges.map((challenge: string, index: number) => (
                                <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                                  <span>{challenge}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600">Mood:</span>
                              <Badge className="bg-purple-100 text-purple-800">
                                {report.mood}
                              </Badge>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Next Day Plan</h4>
                              <ul className="space-y-1">
                                {report.nextDayPlan.map((plan: string, index: number) => (
                                  <li key={index} className="text-sm text-gray-600">• {plan}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="progress" className="space-y-6">
                    <h3 className="text-lg font-semibold">Learning Progress</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Current Module</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium">Communication Skills</span>
                                <span className="text-sm font-bold text-green-600">75%</span>
                              </div>
                              <Progress value={75} className="h-2" />
                            </div>
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium">Public Speaking</span>
                                <span className="text-sm font-bold text-blue-600">60%</span>
                              </div>
                              <Progress value={60} className="h-2" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Achievements</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <Award className="w-5 h-5 text-yellow-500" />
                              <span className="text-sm">First Video Analysis</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <TrendingUp className="w-5 h-5 text-green-500" />
                              <span className="text-sm">5 Day Streak</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Target className="w-5 h-5 text-blue-500" />
                              <span className="text-sm">Completed 3 Modules</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="assignments" className="space-y-6">
                    <h3 className="text-lg font-semibold">Current Assignments</h3>
                    <div className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Video Analysis Practice</CardTitle>
                          <CardDescription>Record and analyze your communication skills</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Due Date</span>
                              <Badge variant="outline">Tomorrow</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Status</span>
                              <Badge variant="secondary">In Progress</Badge>
                            </div>
                            <Button className="w-full">Start Assignment</Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="feedback" className="space-y-6">
                    <h3 className="text-lg font-semibold">Feedback & Reviews</h3>
                    <div className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center justify-between">
                            <span>Video Analysis Feedback</span>
                            <div className="flex items-center space-x-2">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="font-medium">4.5/5</span>
                            </div>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-600 mb-4">&ldquo;Excellent improvement in eye contact and body language. Your confidence has grown significantly.&rdquo;</p>
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>Coach: Sarah Johnson</span>
                            <span>2 days ago</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="learning" className="space-y-6">
                    <h3 className="text-lg font-semibold">Learning Resources</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Available Courses</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <h4 className="font-medium">Communication Basics</h4>
                                <p className="text-sm text-gray-600">Learn fundamental communication skills</p>
                              </div>
                              <Button size="sm">Start</Button>
                            </div>
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <h4 className="font-medium">Public Speaking</h4>
                                <p className="text-sm text-gray-600">Master public speaking techniques</p>
                              </div>
                              <Button size="sm">Start</Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Recommended for You</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="p-3 border rounded-lg">
                              <h4 className="font-medium text-green-600">Advanced Communication</h4>
                              <p className="text-sm text-gray-600">Based on your progress</p>
                            </div>
                            <div className="p-3 border rounded-lg">
                              <h4 className="font-medium text-blue-600">Team Collaboration</h4>
                              <p className="text-sm text-gray-600">Popular with your department</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </Card>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="mt-8">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <p className="text-green-800 text-center">
                <strong>Welcome Back!</strong> Hello {isLoggedInAsEmployee ? (employeeUserData?.firstName || 'Employee') : (user?.firstName || 'User')}! Ready to track your progress?
              </p>
              {/* Debug info */}
              {isLoggedInAsEmployee && (
                <div className="mt-2 text-xs text-gray-600">
                  Debug: Employee ID: {employeeId}, Videos: {employeeStats.totalVideosAnalyzed}, Score: {employeeStats.averageScore}%
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
