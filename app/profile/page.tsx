'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { User, Camera, Save, TrendingUp, Video, BookOpen, Award, Target, BarChart3 } from 'lucide-react';

export default function ProfilePage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with Blue Gradient Background */}
        <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-xl overflow-hidden">
          {/* Geometric Pattern Overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white transform rotate-45 -translate-x-32 -translate-y-32"></div>
            <div className="absolute top-20 right-0 w-48 h-48 bg-white transform rotate-45 translate-x-24 -translate-y-24"></div>
            <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-white transform rotate-45 translate-y-16"></div>
          </div>
          
          <div className="relative p-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-white">Profile</h1>
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Camera className="w-4 h-4 mr-2" />
                Change Cover
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 -mt-20 relative z-10">
          {/* Left Sidebar - Profile Info & KPIs */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Picture Card */}
            <Card className="bg-white shadow-xl border-0">
              <CardContent className="p-6 text-center">
                <div className="relative inline-block mb-4">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mx-auto flex items-center justify-center shadow-xl">
                    <User className="w-16 h-16 text-white" />
                  </div>
                  <div className="absolute bottom-2 right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-1">John Smith</h3>
                <p className="text-gray-600 mb-4">Sales Manager</p>
                
                <Button variant="outline" className="w-full mb-4">
                  <Camera className="w-4 h-4 mr-2" />
                  Change Photo
                </Button>

                {/* Quick Stats */}
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Videos Analyzed</span>
                    <Badge className="bg-blue-100 text-blue-800 font-semibold">23</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Assignments Won</span>
                    <Badge className="bg-green-100 text-green-800 font-semibold">26</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Current Level</span>
                    <Badge className="bg-purple-100 text-purple-800 font-semibold">6</Badge>
                  </div>
                </div>

                <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                  View Public Profile
                </Button>
                
                <div className="mt-4 text-sm text-blue-600">
                  https://app.ahiregro...
                </div>
              </CardContent>
            </Card>

            {/* Performance KPIs */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="text-green-800">Performance Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Overall Score</span>
                      <span className="text-sm font-bold text-green-600">78/100</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Body Language</span>
                      <span className="text-sm font-bold text-green-600">82/100</span>
                    </div>
                    <Progress value={82} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Vocal Tone</span>
                      <span className="text-sm font-bold text-yellow-600">75/100</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Word Power</span>
                      <span className="text-sm font-bold text-yellow-600">77/100</span>
                    </div>
                    <Progress value={77} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Activity Stats */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-800">Activity Stats</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-white/60 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 mb-1">12</div>
                    <div className="text-xs text-gray-600">Videos This Month</div>
                  </div>
                  <div className="text-center p-3 bg-white/60 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 mb-1">8</div>
                    <div className="text-xs text-gray-600">Lessons Completed</div>
                  </div>
                  <div className="text-center p-3 bg-white/60 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 mb-1">156</div>
                    <div className="text-xs text-gray-600">Hours Practiced</div>
                  </div>
                  <div className="text-center p-3 bg-white/60 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600 mb-1">94%</div>
                    <div className="text-xs text-gray-600">Improvement Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <Card className="bg-white shadow-xl border-0">
              <CardHeader className="border-b border-gray-100">
                <div className="flex space-x-8">
                  <button className="pb-4 border-b-2 border-blue-600 text-blue-600 font-semibold">
                    Account Settings
                  </button>
                  <button className="pb-4 text-gray-500 hover:text-gray-700">
                    Company Settings
                  </button>
                  <button className="pb-4 text-gray-500 hover:text-gray-700">
                    Documents
                  </button>
                  <button className="pb-4 text-gray-500 hover:text-gray-700">
                    Billing
                  </button>
                  <button className="pb-4 text-gray-500 hover:text-gray-700">
                    Notifications
                  </button>
                </div>
              </CardHeader>
              
              <CardContent className="p-8">
                <div className="space-y-6">
                  {/* Personal Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">First Name</Label>
                      <Input id="firstName" defaultValue="John" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">Last Name</Label>
                      <Input id="lastName" defaultValue="Smith" className="mt-1" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number</Label>
                      <Input id="phone" defaultValue="+1 (555) 123-4567" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email address</Label>
                      <Input id="email" type="email" defaultValue="john.smith@company.com" className="mt-1" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="city" className="text-sm font-medium text-gray-700">City</Label>
                      <Input id="city" defaultValue="New York" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="state" className="text-sm font-medium text-gray-700">State/County</Label>
                      <Input id="state" defaultValue="NY" className="mt-1" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="postcode" className="text-sm font-medium text-gray-700">Postcode</Label>
                      <Input id="postcode" defaultValue="10001" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="country" className="text-sm font-medium text-gray-700">Country</Label>
                      <Input id="country" defaultValue="United States" className="mt-1" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="role" className="text-sm font-medium text-gray-700">Role</Label>
                    <Input id="role" defaultValue="Sales Manager" className="mt-1" />
                  </div>

                  <div>
                    <Label htmlFor="bio" className="text-sm font-medium text-gray-700">Bio</Label>
                    <Textarea 
                      id="bio" 
                      rows={4}
                      defaultValue="Experienced sales professional with over 10 years in the industry. Passionate about effective communication and team leadership."
                      className="mt-1"
                    />
                  </div>

                  {/* Preferences Section */}
                  <div className="pt-6 border-t border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="timezone" className="text-sm font-medium text-gray-700">Timezone</Label>
                        <Input id="timezone" defaultValue="Eastern Time (ET)" className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="language" className="text-sm font-medium text-gray-700">Language</Label>
                        <Input id="language" defaultValue="English" className="mt-1" />
                      </div>
                    </div>

                    <div className="mt-6 space-y-4">
                      <div className="flex items-center space-x-3">
                        <input type="checkbox" id="notifications" className="rounded border-gray-300" />
                        <Label htmlFor="notifications" className="text-sm text-gray-700">Email notifications</Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <input type="checkbox" id="reports" className="rounded border-gray-300" defaultChecked />
                        <Label htmlFor="reports" className="text-sm text-gray-700">Weekly progress reports</Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <input type="checkbox" id="reminders" className="rounded border-gray-300" defaultChecked />
                        <Label htmlFor="reminders" className="text-sm text-gray-700">Assignment reminders</Label>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-6 border-t border-gray-100">
                    <Button className="bg-blue-600 hover:bg-blue-700 px-8 py-2">
                      <Save className="w-4 h-4 mr-2" />
                      Update
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Video className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-purple-600 mb-1">23</div>
              <div className="text-sm text-gray-600">Total Videos</div>
              <div className="text-xs text-green-600 mt-1">+3 this week</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-green-600 mb-1">15</div>
              <div className="text-sm text-gray-600">Lessons Completed</div>
              <div className="text-xs text-green-600 mt-1">+2 this week</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-orange-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-orange-600 mb-1">7</div>
              <div className="text-sm text-gray-600">Achievements</div>
              <div className="text-xs text-green-600 mt-1">+1 this week</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-blue-600 mb-1">92%</div>
              <div className="text-sm text-gray-600">Goal Progress</div>
              <div className="text-xs text-green-600 mt-1">+5% this week</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}