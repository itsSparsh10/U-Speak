'use client';

import { useState, useEffect } from 'react';
import { formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Play, Clock } from 'lucide-react';

const pendingAssignments = [
  {
    id: '1',
    title: 'Eye Contact Mastery',
    description: 'Practice maintaining consistent eye contact during presentations',
    priority: 'high',
    dueDate: '2024-01-20',
    estimatedTime: '15 min',
    category: 'Body Language'
  },
  {
    id: '2',
    title: 'Filler Word Elimination',
    description: 'Complete exercises to minimize "um", "uh", and other verbal fillers',
    priority: 'high',
    dueDate: '2024-01-22',
    estimatedTime: '20 min',
    category: 'Word Power'
  },
  {
    id: '3',
    title: 'Voice Modulation Practice',
    description: 'Work on varying pitch and tone for better engagement',
    priority: 'medium',
    dueDate: '2024-01-25',
    estimatedTime: '25 min',
    category: 'Vocal Tone'
  },
  {
    id: '4',
    title: 'Gesture Coordination',
    description: 'Practice natural hand gestures that complement speech',
    priority: 'medium',
    dueDate: '2024-01-28',
    estimatedTime: '18 min',
    category: 'Body Language'
  },
  {
    id: '5',
    title: 'Pause and Pacing',
    description: 'Learn strategic pausing techniques for emphasis',
    priority: 'low',
    dueDate: '2024-01-30',
    estimatedTime: '12 min',
    category: 'Vocal Tone'
  }
];

export function PendingAssignments() {
  const [formattedDates, setFormattedDates] = useState<Record<string, string>>({});

  useEffect(() => {
    // Format dates on the client side to avoid hydration mismatch
    const dates: Record<string, string> = {};
    pendingAssignments.forEach(assignment => {
      dates[assignment.id] = formatDate(assignment.dueDate);
    });
    setFormattedDates(dates);
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Body Language': return 'bg-blue-100 text-blue-800';
      case 'Vocal Tone': return 'bg-purple-100 text-purple-800';
      case 'Word Power': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center space-x-3">
          <div className="p-2 rounded-full bg-gradient-to-r from-indigo-400 to-blue-500 shadow-lg">
            <BookOpen className="w-5 h-5 text-white filter drop-shadow-sm" />
          </div>
          <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
            Pending Assignments
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="bg-white/60 backdrop-blur-sm rounded-lg mx-4 mb-4">
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {pendingAssignments.map((assignment) => (
            <div key={assignment.id} className="p-4 bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">{assignment.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{assignment.description}</p>
                  
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge className={`${getPriorityColor(assignment.priority)} font-semibold shadow-sm`}>
                      {assignment.priority} priority
                    </Badge>
                    <Badge className={`${getCategoryColor(assignment.category)} font-semibold shadow-sm`}>
                      {assignment.category}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>Due: {formattedDates[assignment.id] || 'Loading...'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{assignment.estimatedTime}</span>
                    </div>
                  </div>
                </div>
                
                <Button size="sm" className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 ml-4">
                  <Play className="w-4 h-4 mr-1" />
                  Start
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}