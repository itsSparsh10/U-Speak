'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, AlertTriangle } from 'lucide-react';

const strengthsData = [
  { area: 'Eye Contact', score: 92, description: 'Excellent maintenance of eye contact throughout presentations' },
  { area: 'Posture', score: 88, description: 'Strong, confident posture that commands attention' },
  { area: 'Gesture Usage', score: 85, description: 'Natural and effective use of hand gestures' },
  { area: 'Voice Clarity', score: 84, description: 'Clear articulation and pronunciation' },
  { area: 'Enthusiasm', score: 82, description: 'High energy and passion in delivery' }
];

const developmentData = [
  { area: 'Filler Words', score: 45, description: 'Frequent use of "um", "uh", and "like"' },
  { area: 'Speaking Pace', score: 52, description: 'Tendency to speak too quickly during presentations' },
  { area: 'Vocal Variety', score: 58, description: 'Limited variation in pitch and tone' },
  { area: 'Pause Usage', score: 61, description: 'Insufficient strategic pauses for emphasis' },
  { area: 'Sentence Structure', score: 64, description: 'Occasional run-on sentences and incomplete thoughts' }
];

export function StrengthsAndDevelopment() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top 5 Strengths */}
      <Card className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center space-x-3">
            <div className="p-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg">
              <TrendingUp className="w-5 h-5 text-white filter drop-shadow-sm" />
            </div>
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Top 5 Strengths
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 bg-white/60 backdrop-blur-sm rounded-lg mx-4 mb-4">
          {strengthsData.map((strength, index) => (
            <div key={index} className="flex items-start justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100 shadow-md hover:shadow-lg transition-all duration-200">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">#{index + 1}</span>
                  </div>
                  <h4 className="font-semibold text-gray-900">{strength.area}</h4>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 font-semibold shadow-sm">
                    {strength.score}/100
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{strength.description}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Top 5 Development Areas */}
      <Card className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center space-x-3">
            <div className="p-2 rounded-full bg-gradient-to-r from-orange-400 to-amber-500 shadow-lg">
              <AlertTriangle className="w-5 h-5 text-white filter drop-shadow-sm" />
            </div>
            <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              Top 5 Development Areas
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 bg-white/60 backdrop-blur-sm rounded-lg mx-4 mb-4">
          {developmentData.map((area, index) => (
            <div key={index} className="flex items-start justify-between p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100 shadow-md hover:shadow-lg transition-all duration-200">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">#{index + 1}</span>
                  </div>
                  <h4 className="font-semibold text-gray-900">{area.area}</h4>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800 font-semibold shadow-sm">
                    {area.score}/100
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{area.description}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}