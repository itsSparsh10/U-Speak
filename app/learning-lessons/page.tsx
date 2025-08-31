'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { AssignmentViewer } from '@/components/learning/assignment-viewer';
import VoiceModulationTechniques from '@/components/learning/Learning Materials/Voice Modulation Techniques';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Play, Clock, Star, TrendingUp, AlertTriangle, CheckCircle, Target, MessageSquare, Heart, Users, Zap, Mic, Presentation, Brain, BarChart3, GraduationCap, ClipboardList } from 'lucide-react';

// Strengths and Weaknesses Data
const userStrengths = [
  { area: 'Eye Contact', score: 92, description: 'Excellent maintenance of eye contact throughout presentations' },
  { area: 'Posture', score: 88, description: 'Strong, confident posture that commands attention' },
  { area: 'Voice Clarity', score: 84, description: 'Clear articulation and pronunciation' }
];

const userWeaknesses = [
  { area: 'Filler Words', score: 45, description: 'Frequent use of "um", "uh", and "like"' },
  { area: 'Speaking Pace', score: 52, description: 'Tendency to speak too quickly during presentations' },
  { area: 'Vocal Variety', score: 58, description: 'Limited variation in pitch and tone' }
];

// Assignments Data
const assignments = [
  {
    id: '1',
    title: 'Improve Eye Contact Techniques',
    description: 'Practice maintaining consistent eye contact during presentations',
    status: 'pending',
    priority: 'high',
    dueDate: '2024-01-20',
    estimatedTime: '15 min',
    category: 'Body Language',
    progress: 0
  },
  {
    id: '2',
    title: 'Reduce Filler Words',
    description: 'Complete exercises to minimize "um", "uh", and other verbal fillers',
    status: 'in-progress',
    priority: 'high',
    dueDate: '2024-01-22',
    estimatedTime: '20 min',
    category: 'Word Power',
    progress: 60
  },
  {
    id: '3',
    title: 'Voice Modulation Practice',
    description: 'Work on varying pitch and tone for better engagement',
    status: 'completed',
    priority: 'medium',
    dueDate: '2024-01-18',
    estimatedTime: '25 min',
    category: 'Vocal Tone',
    progress: 100
  }
];

const lessons = [
  {
    id: 1,
    title: 'Mastering Eye Contact',
    description: 'Learn how to maintain appropriate eye contact to build trust and engagement',
    duration: '15 min',
    difficulty: 'Beginner',
    rating: 4.8,
    category: 'Body Language',
    thumbnail: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 2,
    title: 'Voice Modulation Techniques',
    description: 'Discover how to vary your pitch, pace, and volume for maximum impact',
    duration: '22 min',
    difficulty: 'Intermediate',
    rating: 4.9,
    category: 'Vocal Tone',
    thumbnail: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 3,
    title: 'Eliminating Filler Words',
    description: 'Strategies to reduce "um", "uh", and other verbal fillers in your speech',
    duration: '18 min',
    difficulty: 'Beginner',
    rating: 4.7,
    category: 'Word Power',
    thumbnail: 'https://images.pexels.com/photos/3184287/pexels-photo-3184287.jpeg?auto=compress&cs=tinysrgb&w=400'
  }
];

// New learning materials (smaller cards with icons)
const newLearningMaterials = [
  {
    id: 4,
    title: 'Storytelling',
    description: 'Master the art of compelling storytelling for presentations',
    duration: '20 min',
    difficulty: 'Intermediate',
    category: 'Communication',
    icon: MessageSquare
  },
  {
    id: 5,
    title: 'Empathy',
    description: 'Develop empathy skills for better interpersonal communication',
    duration: '18 min',
    difficulty: 'Beginner',
    category: 'Interpersonal',
    icon: Heart
  },
  {
    id: 6,
    title: 'Communication Tips',
    description: 'Essential tips for effective communication in any setting',
    duration: '25 min',
    difficulty: 'Beginner',
    category: 'Communication',
    icon: Users
  },
  {
    id: 7,
    title: 'Communication Styles',
    description: 'Understand different communication styles and adapt accordingly',
    duration: '30 min',
    difficulty: 'Intermediate',
    category: 'Communication',
    icon: Zap
  },
  {
    id: 8,
    title: 'Crucial Conversations',
    description: 'Navigate difficult conversations with confidence and skill',
    duration: '35 min',
    difficulty: 'Advanced',
    category: 'Communication',
    icon: Mic
  },
  {
    id: 9,
    title: 'Anxiety',
    description: 'Manage presentation anxiety and build confidence',
    duration: '22 min',
    difficulty: 'Beginner',
    category: 'Mental Health',
    icon: Brain
  },
  {
    id: 10,
    title: 'Confidence',
    description: 'Build unshakeable confidence for public speaking',
    duration: '28 min',
    difficulty: 'Intermediate',
    category: 'Mental Health',
    icon: Presentation
  },
  {
    id: 11,
    title: 'Elevator Speech',
    description: 'Craft and deliver compelling elevator pitches',
    duration: '15 min',
    difficulty: 'Beginner',
    category: 'Communication',
    icon: MessageSquare
  },
  {
    id: 12,
    title: 'Interviewing Skills',
    description: 'Master interview techniques and communication',
    duration: '40 min',
    difficulty: 'Intermediate',
    category: 'Professional',
    icon: Users
  },
  {
    id: 13,
    title: 'Using Data',
    description: 'Effectively present and communicate data insights',
    duration: '32 min',
    difficulty: 'Advanced',
    category: 'Analytics',
    icon: BarChart3
  }
];

export default function LearningLessonsPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [formattedDates, setFormattedDates] = useState<Record<string, string>>({});

  useEffect(() => {
    // Format dates on the client side to avoid hydration mismatch
    const dates: Record<string, string> = {};
    assignments.forEach(assignment => {
      dates[assignment.id] = formatDate(assignment.dueDate);
    });
    setFormattedDates(dates);
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm';
      case 'Intermediate': return 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 border border-blue-200 shadow-sm';
      case 'Advanced': return 'bg-gradient-to-r from-blue-900 to-blue-800 text-white border border-blue-700 shadow-sm';
      default: return 'bg-gradient-to-r from-slate-100 to-slate-50 text-slate-800 border border-slate-200 shadow-sm';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStartLesson = (category: string) => {
    setSelectedCategory(category);
  };

  if (selectedCategory) {
    return (
      <DashboardLayout>
        <AssignmentViewer 
          category={selectedCategory} 
          onBack={() => setSelectedCategory(null)} 
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Learning & Development</h1>
          </div>
        </div>

        {/* Lessons Grid */}
        <Card className="overflow-hidden border border-slate-200 shadow-lg bg-gradient-to-br from-white via-gray-50/30 to-gray-50/50">
          <CardHeader className="bg-gradient-to-br from-white via-gray-50 to-gray-100 text-gray-900 border-b-0 p-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#1e3a8a] via-[#3b82f6] to-[#60a5fa] rounded-2xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-7 h-7 text-white drop-shadow-sm" />
              </div>
              <div className="flex flex-col">
                <CardTitle className="text-2xl font-extrabold text-gray-900">Learning Materials</CardTitle>
                <p className="text-gray-600 text-sm">Core learning materials for communication and presentation skills</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {lessons.map((lesson) => (
              <div key={lesson.id} className="border border-slate-200 rounded-xl hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-white via-gray-50/20 to-gray-50/40">
              <CardHeader className="p-0">
                <div className="relative">
                  <img
                    src={lesson.thumbnail}
                    alt={lesson.title}
                    className="w-full h-48 object-cover rounded-t-xl"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] text-white">
                      {lesson.category}
                    </Badge>
                  </div>
                  <div className="absolute bottom-4 right-4 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{lesson.duration}</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <CardTitle className="text-lg font-semibold text-slate-900 mb-2">
                      {lesson.title}
                    </CardTitle>
                    <p className="text-slate-600 text-sm">
                      {lesson.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge className={getDifficultyColor(lesson.difficulty)}>
                      {lesson.difficulty}
                    </Badge>
                  </div>

                  <Button 
                    className="w-full bg-gradient-to-r from-[#1e3a8a] via-[#3b82f6] to-[#60a5fa] hover:from-[#1e40af] hover:via-[#2563eb] hover:to-[#3b82f6] text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={() => {
                      if (lesson.title === 'Voice Modulation Techniques') {
                        router.push('/learning-lessons/voice-modulation-techniques');
                      } else if (lesson.title === 'Mastering Eye Contact') {
                        router.push('/learning-lessons/mastering-eye-contact');
                      } else if (lesson.title === 'Eliminating Filler Words') {
                        router.push('/learning-lessons/eliminating-filler-words');
                      } else if (lesson.title === 'Storytelling') {
                        router.push('/learning-lessons/Start_lesson_global/storytelling');
                      } else {
                        router.push('/learning-lessons/Start_lesson_global');
                      }
                    }}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Lesson
                  </Button>
                </div>
              </CardContent>
              </div>
          ))}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Additional Learning Materials Grid */}
        <Card className="overflow-hidden border border-slate-200 shadow-lg bg-gradient-to-br from-white via-gray-50/30 to-gray-50/50">
          <CardHeader className="bg-gradient-to-br from-white via-gray-50 to-gray-100 text-gray-900 border-b-0 p-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#1e3a8a] via-[#3b82f6] to-[#60a5fa] rounded-2xl flex items-center justify-center shadow-lg">
                <Presentation className="w-7 h-7 text-white drop-shadow-sm" />
              </div>
              <div className="flex flex-col">
                <CardTitle className="text-2xl font-extrabold text-gray-900">Additional Learning Materials</CardTitle>
                <p className="text-gray-600 text-sm">Explore our comprehensive collection of communication and presentation skills</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
              {newLearningMaterials.map((material) => {
                const IconComponent = material.icon;
                return (
                  <div 
                    key={material.id} 
                    className="group relative bg-gradient-to-br from-white via-gray-50/20 to-gray-50/40 rounded-2xl border border-slate-200 hover:border-blue-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
                  >
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-blue-100/0 group-hover:from-blue-50/50 group-hover:to-blue-100/30 transition-all duration-300"></div>
                    
                    <div className="relative p-6 flex flex-col items-center text-center space-y-4">
                      {/* Enhanced icon container with uSpeek brand gradient */}
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#1e3a8a] via-[#3b82f6] to-[#60a5fa] rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
                          <IconComponent className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="space-y-3 flex-1">
                        <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-900 transition-colors duration-200 line-clamp-2">
                          {material.title}
                        </h3>
                        <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                          {material.description}
                        </p>
                        
                        {/* Enhanced metadata */}
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center space-x-2 text-sm text-slate-500">
                            <Clock className="w-4 h-4" />
                            <span className="font-medium">{material.duration}</span>
                          </div>
                          <Badge 
                            className={`${getDifficultyColor(material.difficulty)} font-semibold px-3 py-1 rounded-full text-xs shadow-sm`}
                          >
                            {material.difficulty}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Enhanced button with uSpeek brand gradient */}
                      <Button 
                        size="sm" 
                        className="w-full bg-gradient-to-r from-[#1e3a8a] via-[#3b82f6] to-[#60a5fa] hover:from-[#1e40af] hover:via-[#2563eb] hover:to-[#3b82f6] text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:scale-105"
                        onClick={() => {
                          if (material.title === 'Storytelling') {
                            router.push('/learning-lessons/Start_lesson_global/storytelling');
                          } else if (material.title === 'Empathy') {
                            router.push('/learning-lessons/empathy');
                          } else if (material.title === 'Communication Tips') {
                            router.push('/learning-lessons/communication-tips');
                          } else if (material.title === 'Communication Styles') {
                            router.push('/learning-lessons/communication-styles');
                          } else if (material.title === 'Crucial Conversations') {
                            router.push('/learning-lessons/crucial-conversations');
                          } else if (material.title === 'Anxiety') {
                            router.push('/learning-lessons/anxiety');
                          } else if (material.title === 'Confidence') {
                            router.push('/learning-lessons/confidence');
                          } else if (material.title === 'Elevator Speech') {
                            router.push('/learning-lessons/elevator-speech');
                          } else if (material.title === 'Interviewing Skills') {
                            router.push('/learning-lessons/interviewing-skills');
                          } else if (material.title === 'Using Data') {
                            router.push('/learning-lessons/using-data');
                          } else {
                            router.push('/learning-lessons/Start_lesson_global');
                          }
                        }}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Start Learning
                      </Button>
                    </div>
                    
                    {/* Subtle border accent with brand colors */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1e3a8a] via-[#3b82f6] to-[#60a5fa] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Assignments */}
        <Card className="overflow-hidden border border-slate-200 shadow-lg bg-gradient-to-br from-white via-gray-50/30 to-gray-50/50">
          <CardHeader className="bg-gradient-to-br from-white via-gray-50 to-gray-100 text-gray-900 border-b-0 p-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#1e3a8a] via-[#3b82f6] to-[#60a5fa] rounded-2xl flex items-center justify-center shadow-lg">
                <ClipboardList className="w-7 h-7 text-white drop-shadow-sm" />
              </div>
              <div className="flex flex-col">
                <CardTitle className="text-2xl font-extrabold text-gray-900">Your Assignments</CardTitle>
                <p className="text-gray-600 text-sm">Track your progress and complete assigned tasks</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {assignments.map((assignment) => (
                <div key={assignment.id} className="p-4 border border-slate-200 rounded-xl hover:shadow-md transition-shadow bg-gradient-to-br from-white via-gray-50/20 to-gray-50/40">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold text-slate-900">{assignment.title}</h4>
                        {assignment.status === 'completed' && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mb-3">{assignment.description}</p>
                      
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={getStatusColor(assignment.status)}>
                          {assignment.status.replace('-', ' ')}
                        </Badge>
                        <Badge className={getPriorityColor(assignment.priority)}>
                          {assignment.priority} priority
                        </Badge>
                        <Badge variant="outline">
                          {assignment.category}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-xs text-slate-500">
                        <span>Due: {formattedDates[assignment.id] || 'Loading...'}</span>
                        <span>{assignment.estimatedTime}</span>
                        <span>Progress: {assignment.progress}%</span>
                      </div>
                      
                      {assignment.progress > 0 && assignment.progress < 100 && (
                        <div className="mt-2">
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] h-2 rounded-full" 
                              style={{ width: `${assignment.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-4">
                      {assignment.status !== 'completed' && (
                        <Button size="sm" className="bg-gradient-to-r from-[#1e3a8a] via-[#3b82f6] to-[#60a5fa] hover:from-[#1e40af] hover:via-[#2563eb] hover:to-[#3b82f6] text-white font-semibold">
                          <Play className="w-4 h-4 mr-1" />
                          {assignment.status === 'pending' ? 'Start' : 'Continue'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Strengths and Weaknesses Section */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Strengths */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span>Your Strengths</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {userStrengths.map((strength, index) => (
                <div key={index} className="p-4 bg-green-50 rounded-lg border border-green-100">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{strength.area}</h4>
                    <Badge className="bg-green-100 text-green-800">
                      {strength.score}/100
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{strength.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Weaknesses */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                <span>Areas for Improvement</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {userWeaknesses.map((weakness, index) => (
                <div key={index} className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{weakness.area}</h4>
                    <Badge className="bg-orange-100 text-orange-800">
                      {weakness.score}/100
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{weakness.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}