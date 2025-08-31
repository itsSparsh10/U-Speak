'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart
} from 'recharts';
import { 
  BarChart3Icon, 
  TrendingUpIcon, 
  PieChartIcon, 
  ActivityIcon,
  TargetIcon,
  UsersIcon
} from 'lucide-react';

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
  // employee_id can be null/missing in some malformed records -> mark optional and allow null
  employee_id?: { first_name?: string; last_name?: string; department?: string; job_title?: string } | null;
  status: string;
  progress_percentage: number;
  assigned_at: string;
  completed_at?: string;
  score?: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FF6B6B', '#4ECDC4'];

interface AssignmentChartsProps {
  assignments: AssignmentMaster[];
  instances: AssignmentInstance[];
  employeeAssignments: AssignmentEmployee[];
}

export default function AssignmentCharts({ assignments, instances, employeeAssignments }: AssignmentChartsProps) {
  
  // Status Distribution Data
  const getStatusBreakdownData = () => {
    const statusCounts = employeeAssignments.reduce((acc, assignment) => {
      acc[assignment.status] = (acc[assignment.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      percentage: Math.round((count / employeeAssignments.length) * 100)
    }));
  };

  // Department Performance Data
  const getDepartmentPerformanceData = () => {
    const deptData = employeeAssignments.reduce((acc, assignment) => {
      // Safely read department; skip entries where employee_id or department is missing
      const dept = assignment.employee_id?.department;
      if (!dept) return acc;
      if (!acc[dept]) {
        acc[dept] = { total: 0, completed: 0, inProgress: 0, overdue: 0 };
      }
      acc[dept].total++;
      if (assignment.status === 'COMPLETED') acc[dept].completed++;
      else if (assignment.status === 'IN_PROGRESS') acc[dept].inProgress++;
      else if (assignment.status === 'OVERDUE') acc[dept].overdue++;
      return acc;
    }, {} as Record<string, { total: number; completed: number; inProgress: number; overdue: number }>);

    return Object.entries(deptData).map(([dept, data]) => ({
      department: dept,
      completed: data.completed,
      inProgress: data.inProgress,
      overdue: data.overdue,
      completionRate: Math.round((data.total > 0 ? (data.completed / data.total) * 100 : 0))
    }));
  };

  // Assignment Types Data
  const getAssignmentTypeData = () => {
    const typeCounts = assignments.reduce((acc, assignment) => {
      acc[assignment.assignment_type] = (acc[assignment.assignment_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(typeCounts).map(([type, count]) => ({
      type,
      count,
      color: COLORS[Object.keys(typeCounts).indexOf(type) % COLORS.length]
    }));
  };

  // Progress Trends Data
  const getProgressTrendData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const dayAssignments = employeeAssignments.filter(assignment => {
        // Validate assigned_at before parsing
        if (!assignment.assigned_at) return false;
        try {
          const assignmentDate = new Date(assignment.assigned_at).toISOString().split('T')[0];
          return assignmentDate === date;
        } catch (error) {
          console.warn('Invalid assigned_at date:', assignment.assigned_at);
          return false;
        }
      });

      return {
        date,
        newAssignments: dayAssignments.length,
        completed: dayAssignments.filter(a => a.status === 'COMPLETED').length,
        averageProgress: dayAssignments.length > 0 
          ? Math.round(dayAssignments.reduce((sum, a) => sum + (a.progress_percentage || 0), 0) / dayAssignments.length)
          : 0
      };
    });
  };

  // Monthly Assignment Trends
  const getMonthlyTrends = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    return months.map((month, index) => {
      const monthAssignments = employeeAssignments.filter(assignment => {
        // Validate assigned_at before parsing
        if (!assignment.assigned_at) return false;
        try {
          const assignmentMonth = new Date(assignment.assigned_at).getMonth();
          return assignmentMonth === index;
        } catch (error) {
          console.warn('Invalid assigned_at date:', assignment.assigned_at);
          return false;
        }
      });

      return {
        month,
        assignments: monthAssignments.length,
        completed: monthAssignments.filter(a => a.status === 'COMPLETED').length,
        completionRate: monthAssignments.length > 0 
          ? Math.round((monthAssignments.filter(a => a.status === 'COMPLETED').length / monthAssignments.length) * 100)
          : 0
      };
    });
  };

  // Score Distribution (if scores exist)
  const getScoreDistribution = () => {
    const scoredAssignments = employeeAssignments.filter(a => a.score !== undefined);
    if (scoredAssignments.length === 0) return [];

    const scoreRanges = [
      { range: '0-20', min: 0, max: 20 },
      { range: '21-40', min: 21, max: 40 },
      { range: '41-60', min: 41, max: 60 },
      { range: '61-80', min: 61, max: 80 },
      { range: '81-100', min: 81, max: 100 }
    ];

    return scoreRanges.map(({ range, min, max }) => ({
      range,
      count: scoredAssignments.filter(a => (a.score || 0) >= min && (a.score || 0) <= max).length
    }));
  };

  return (
    <div className="space-y-6">
      {/* Status Distribution Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="w-5 h-5" />
            Assignment Status Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={getStatusBreakdownData()}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ status, percentage }) => `${status}: ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {getStatusBreakdownData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Assignment Types Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3Icon className="w-5 h-5" />
            Assignment Types Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getAssignmentTypeData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Progress Trends Line Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUpIcon className="w-5 h-5" />
            Progress Trends (Last 7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={getProgressTrendData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="newAssignments" stroke="#8884d8" strokeWidth={2} name="New Assignments" />
              <Line type="monotone" dataKey="completed" stroke="#82ca9d" strokeWidth={2} name="Completed" />
              <Line type="monotone" dataKey="averageProgress" stroke="#ffc658" strokeWidth={2} name="Avg Progress %" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Department Performance Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UsersIcon className="w-5 h-5" />
            Department Performance Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getDepartmentPerformanceData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="completed" fill="#82ca9d" name="Completed" />
              <Bar dataKey="inProgress" fill="#8884d8" name="In Progress" />
              <Bar dataKey="overdue" fill="#ff8042" name="Overdue" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Monthly Trends Area Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ActivityIcon className="w-5 h-5" />
            Monthly Assignment Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={getMonthlyTrends()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="assignments" stackId="1" stroke="#8884d8" fill="#8884d8" name="Total Assignments" />
              <Area type="monotone" dataKey="completed" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Completed" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Department Performance Radar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3Icon className="w-5 h-5" />
            Department Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={getDepartmentPerformanceData()}>
              <PolarGrid />
              <PolarAngleAxis dataKey="department" />
              <PolarRadiusAxis />
              <Radar name="Completion Rate" dataKey="completionRate" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Score Distribution (if scores exist) */}
      {getScoreDistribution().length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TargetIcon className="w-5 h-5" />
              Score Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={getScoreDistribution()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
