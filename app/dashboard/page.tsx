'use client';

import { useState, useEffect } from 'react';
import { formatDate } from '@/lib/utils';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { OverallScore } from '@/components/dashboard/overall-score';
import { TrendChart } from '@/components/dashboard/trend-chart';
import { ScoreCards } from '@/components/dashboard/score-cards';
import { TrendCharts } from '@/components/dashboard/trend-charts';
import { StrengthsAndDevelopment } from '@/components/dashboard/strengths-development';
import { TopLowPerformingVideos } from '@/components/dashboard/top-low-performing-videos';
import { PendingAssignments } from '@/components/dashboard/pending-assignments';
import { VideoScoresChart } from '@/components/dashboard/video-scores-chart';
import { useAuth } from '@/hooks/use-auth';

export default function DashboardPage() {
  const [currentDate, setCurrentDate] = useState<string>('');
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  useEffect(() => {
    // Set the date only on the client side to avoid hydration mismatch
    const formattedDate = formatDate(new Date());
    setCurrentDate(formattedDate);
  }, []);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please log in to access the dashboard.</p>
          <button
            onClick={() => window.location.href = '/auth'}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Communication Analytics Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">
              Welcome back, {user?.firstName} {user?.lastName}
              {user?.companyName && ` • ${user.companyName}`}
            </p>
          </div>
        </div>

        {/* Overall Score and Main Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <OverallScore />
          </div>
          <div className="lg:col-span-2">
            <TrendChart />
          </div>
        </div>

        {/* Score Cards */}
        <ScoreCards />

        {/* Individual Trend Charts */}
        <TrendCharts />

        {/* Strengths & Development Areas */}
        <StrengthsAndDevelopment />

        {/* Top and Low Performing Videos */}
        <TopLowPerformingVideos />

        {/* Video Scores Chart */}
        <VideoScoresChart />

        {/* Pending Assignments */}
        <PendingAssignments />
      </div>
    </DashboardLayout>
  );
}