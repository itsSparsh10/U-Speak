'use client';

import { useState, useEffect } from 'react';
import { formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Eye } from 'lucide-react';

const topPerformingVideos = [
  {
    id: '1',
    title: 'Quarterly Presentation',
    speaker: 'Sarah Johnson',
    score: 94,
    date: '2024-01-15'
  },
  {
    id: '2',
    title: 'Team Meeting',
    speaker: 'Michael Chen',
    score: 89,
    date: '2024-01-12'
  },
  {
    id: '3',
    title: 'Client Pitch',
    speaker: 'Emily Davis',
    score: 87,
    date: '2024-01-10'
  }
];

const lowPerformingVideos = [
  {
    id: '4',
    title: 'Status Update',
    speaker: 'David Miller',
    score: 58,
    date: '2024-01-08'
  },
  {
    id: '5',
    title: 'Training Session',
    speaker: 'Alex Wilson',
    score: 62,
    date: '2024-01-05'
  },
  {
    id: '6',
    title: 'Project Update',
    speaker: 'Lisa Brown',
    score: 65,
    date: '2024-01-03'
  }
];

export function TopLowPerformingVideos() {
  const [formattedDates, setFormattedDates] = useState<Record<string, string>>({});

  useEffect(() => {
    // Format dates on the client side to avoid hydration mismatch
    const dates: Record<string, string> = {};
    [...topPerformingVideos, ...lowPerformingVideos].forEach(video => {
      dates[video.id] = formatDate(video.date);
    });
    setFormattedDates(dates);
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top Performing Videos */}
      <Card className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center space-x-3">
            <div className="p-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg">
              <TrendingUp className="w-5 h-5 text-white filter drop-shadow-sm" />
            </div>
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Top Performing Videos
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 bg-white/60 backdrop-blur-sm rounded-lg mx-4 mb-4">
          {topPerformingVideos.map((video, index) => (
            <div key={video.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100 shadow-md hover:shadow-lg transition-all duration-200">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">#{index + 1}</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 text-sm">{video.title}</h4>
                </div>
                <p className="text-xs text-gray-600">{video.speaker} • {formattedDates[video.id] || 'Loading...'}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={`${getScoreColor(video.score)} font-semibold shadow-sm`}>
                  {video.score}/100
                </Badge>
                <Button variant="ghost" size="sm" className="hover:bg-green-100 transition-colors">
                  <Eye className="w-4 h-4 text-green-600" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Low Performing Videos */}
      <Card className="bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center space-x-3">
            <div className="p-2 rounded-full bg-gradient-to-r from-red-400 to-rose-500 shadow-lg">
              <TrendingDown className="w-5 h-5 text-white filter drop-shadow-sm" />
            </div>
            <span className="bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
              Low Performing Videos
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 bg-white/60 backdrop-blur-sm rounded-lg mx-4 mb-4">
          {lowPerformingVideos.map((video, index) => (
            <div key={video.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl border border-red-100 shadow-md hover:shadow-lg transition-all duration-200">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-red-500 to-rose-500 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">#{index + 1}</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 text-sm">{video.title}</h4>
                </div>
                <p className="text-xs text-gray-600">{video.speaker} • {formattedDates[video.id] || 'Loading...'}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={`${getScoreColor(video.score)} font-semibold shadow-sm`}>
                  {video.score}/100
                </Badge>
                <Button variant="ghost" size="sm" className="hover:bg-red-100 transition-colors">
                  <Eye className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}