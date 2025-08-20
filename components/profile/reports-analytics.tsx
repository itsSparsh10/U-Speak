'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, TrendingUp, TrendingDown, Users, Video, BookOpen, 
  Download, Filter, Calendar, Target, Award, Activity
} from 'lucide-react';

interface PerformanceData {
  division: string;
  averageScore: number;
  totalEmployees: number;
  videosAnalyzed: number;
  lessonsCompleted: number;
  improvementRate: number;
}

interface EngagementMetrics {
  totalTimeSpent: number;
  averageSessionDuration: number;
  completionRate: number;
  activeUsers: number;
  inactiveUsers: number;
}

interface TimeSeriesData {
  date: string;
  score: number;
  videos: number;
  lessons: number;
}

export function ReportsAnalytics() {
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [engagementMetrics, setEngagementMetrics] = useState<EngagementMetrics>({
    totalTimeSpent: 0,
    averageSessionDuration: 0,
    completionRate: 0,
    activeUsers: 0,
    inactiveUsers: 0
  });
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [selectedAttribute, setSelectedAttribute] = useState('division');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedTimeframe, selectedAttribute]);

  const fetchAnalyticsData = async () => {
    try {
      // Mock data - replace with actual API call
      const mockPerformanceData: PerformanceData[] = [
        {
          division: 'North Division',
          averageScore: 82,
          totalEmployees: 8,
          videosAnalyzed: 45,
          lessonsCompleted: 32,
          improvementRate: 12
        },
        {
          division: 'East Division',
          averageScore: 75,
          totalEmployees: 6,
          videosAnalyzed: 28,
          lessonsCompleted: 24,
          improvementRate: 8
        },
        {
          division: 'Central Division',
          averageScore: 88,
          totalEmployees: 5,
          videosAnalyzed: 38,
          lessonsCompleted: 30,
          improvementRate: 15
        },
        {
          division: 'West Division',
          averageScore: 65,
          totalEmployees: 6,
          videosAnalyzed: 22,
          lessonsCompleted: 18,
          improvementRate: 5
        }
      ];

      const mockEngagementMetrics: EngagementMetrics = {
        totalTimeSpent: 1240,
        averageSessionDuration: 45,
        completionRate: 87,
        activeUsers: 23,
        inactiveUsers: 2
      };

      const mockTimeSeriesData: TimeSeriesData[] = [
        { date: '2024-01-01', score: 72, videos: 12, lessons: 8 },
        { date: '2024-01-08', score: 75, videos: 15, lessons: 10 },
        { date: '2024-01-15', score: 78, videos: 18, lessons: 12 },
        { date: '2024-01-22', score: 82, videos: 22, lessons: 15 },
        { date: '2024-01-29', score: 85, videos: 25, lessons: 18 }
      ];

      setPerformanceData(mockPerformanceData);
      setEngagementMetrics(mockEngagementMetrics);
      setTimeSeriesData(mockTimeSeriesData);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setIsLoading(false);
    }
  };

  const exportReport = (format: 'csv' | 'pdf') => {
    // Mock export functionality
    console.log(`Exporting report in ${format} format`);
    alert(`Report exported in ${format.toUpperCase()} format`);
  };

  const getImprovementColor = (rate: number) => {
    if (rate > 10) return 'text-green-600';
    if (rate > 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getImprovementIcon = (rate: number) => {
    if (rate > 0) return <TrendingUp className="w-4 h-4" />;
    return <TrendingDown className="w-4 h-4" />;
  };

  if (isLoading) {
    return <div>Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
          <p className="text-gray-600">Track performance, engagement, and progress across your organization</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => exportReport('csv')}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => exportReport('pdf')}>
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Timeframe</label>
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Group By</label>
              <select
                value={selectedAttribute}
                onChange={(e) => setSelectedAttribute(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="division">Division</option>
                <option value="department">Department</option>
                <option value="function">Function</option>
                <option value="role">Role Level</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Overall Score</p>
                <p className="text-xl font-bold">78%</p>
                <p className="text-xs text-green-600">+3% vs last period</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-xl font-bold">{engagementMetrics.activeUsers}</p>
                <p className="text-xs text-green-600">92% of total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Video className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Total Videos</p>
                <p className="text-xl font-bold">133</p>
                <p className="text-xs text-green-600">+15 this period</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Lessons Completed</p>
                <p className="text-xl font-bold">104</p>
                <p className="text-xs text-green-600">+8 this period</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance by Division */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Performance by {selectedAttribute === 'division' ? 'Division' : 'Department'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {performanceData.map((item, index) => (
              <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <h4 className="font-medium text-gray-900">{item.division}</h4>
                    <Badge variant="outline">{item.totalEmployees} employees</Badge>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Average Score</div>
                      <div className="text-lg font-bold">{item.averageScore}%</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Improvement</div>
                      <div className={`flex items-center space-x-1 ${getImprovementColor(item.improvementRate)}`}>
                        {getImprovementIcon(item.improvementRate)}
                        <span className="font-medium">{item.improvementRate}%</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">Score</span>
                      <span className="text-sm font-medium">{item.averageScore}%</span>
                    </div>
                    <Progress value={item.averageScore} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">Videos</span>
                      <span className="text-sm font-medium">{item.videosAnalyzed}</span>
                    </div>
                    <Progress value={(item.videosAnalyzed / 50) * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">Lessons</span>
                      <span className="text-sm font-medium">{item.lessonsCompleted}</span>
                    </div>
                    <Progress value={(item.lessonsCompleted / 40) * 100} className="h-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>Engagement Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Time Spent</span>
                <span className="font-medium">{engagementMetrics.totalTimeSpent} hours</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg Session Duration</span>
                <span className="font-medium">{engagementMetrics.averageSessionDuration} minutes</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Completion Rate</span>
                <span className="font-medium">{engagementMetrics.completionRate}%</span>
              </div>
            </div>
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">User Activity</span>
                <span className="text-sm text-gray-500">{engagementMetrics.activeUsers}/{engagementMetrics.activeUsers + engagementMetrics.inactiveUsers}</span>
              </div>
              <Progress value={(engagementMetrics.activeUsers / (engagementMetrics.activeUsers + engagementMetrics.inactiveUsers)) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>Progress Trends</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {timeSeriesData.slice(-5).map((data, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">{data.date}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium">{data.score}%</span>
                    <span className="text-xs text-gray-500">{data.videos} videos</span>
                    <span className="text-xs text-gray-500">{data.lessons} lessons</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Performance Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Division</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Employees</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Avg Score</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Videos</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Lessons</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Improvement</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {performanceData.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{item.division}</td>
                    <td className="py-3 px-4">{item.totalEmployees}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{item.averageScore}%</span>
                        <Progress value={item.averageScore} className="w-16 h-2" />
                      </div>
                    </td>
                    <td className="py-3 px-4">{item.videosAnalyzed}</td>
                    <td className="py-3 px-4">{item.lessonsCompleted}</td>
                    <td className="py-3 px-4">
                      <div className={`flex items-center space-x-1 ${getImprovementColor(item.improvementRate)}`}>
                        {getImprovementIcon(item.improvementRate)}
                        <span>{item.improvementRate}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={
                        item.averageScore >= 80 ? 'bg-green-100 text-green-800' :
                        item.averageScore >= 70 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {item.averageScore >= 80 ? 'Excellent' :
                         item.averageScore >= 70 ? 'Good' : 'Needs Improvement'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
