'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BaseVideoPlayer } from '@/components/learning/base-video-player';
import { 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  Users, 
  CheckCircle, 
  Play, 
  Star,
  Video,
  FileText,
  ChevronRight,
  ChevronDown,
  Youtube
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface Session {
  id: string;
  title: string;
  description: string;
  duration: string;
  type: 'video' | 'text' | 'quiz';
  isActive: boolean;
  isCompleted: boolean;
  videoUrl?: string;
}

interface DropdownItem {
  id: string;
  title: string;
  isExpanded?: boolean;
  children?: DropdownItem[];
}

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizContent {
  questions: QuizQuestion[];
}

interface LessonContentItem {
  title: string;
  description: string;
  content: string;
  objectives: string[];
  keyPoints: string[];
  quiz?: QuizContent;
  videoUrl?: string;
}

interface BaseLearningMaterialProps {
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  sessionsStructure: DropdownItem[];
  contentData: Record<string, LessonContentItem>;
  onBack?: () => void;
  navigationStyle?: 'sidebar' | 'horizontal';
}

function BaseLearningMaterial({
  title,
  description,
  difficulty,
  duration,
  sessionsStructure,
  contentData,
  onBack,
  navigationStyle = 'sidebar'
}: BaseLearningMaterialProps) {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [currentContent, setCurrentContent] = useState<LessonContentItem | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [selectedDropdownItem, setSelectedDropdownItem] = useState<DropdownItem | null>(null);
  const [progress, setProgress] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [showQuizResults, setShowQuizResults] = useState(false);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setExpandedItems(new Set());
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Clear previous state when props change
    setSelectedSession(null);
    setCurrentContent(null);
    setSelectedDropdownItem(null);
    setExpandedItems(new Set());
    setProgress(0);
    setIsSessionActive(false);
    setCurrentQuizQuestion(0);
    setQuizAnswers([]);
    setShowQuizResults(false);

    // Find the first actual session (not just parent items)
    const findFirstSession = (items: DropdownItem[]): DropdownItem | null => {
      for (const item of items) {
        if (item.children && item.children.length > 0) {
          // If it has children, find the first child
          return findFirstSession(item.children);
        } else {
          // If it's a leaf node (no children), this is a session
          return item;
        }
      }
      return null;
    };

    const firstSession = findFirstSession(sessionsStructure);
    if (firstSession) {
      setSelectedDropdownItem(firstSession);
      const content = contentData[firstSession.id];
      if (content) {
        setCurrentContent(content);
        setSelectedSession({
          id: firstSession.id,
          title: content.title,
          description: content.description,
          duration: '15:00',
          type: 'video',
          isActive: false,
          isCompleted: false,
          videoUrl: content.videoUrl
        });
        
        // Expand the parent item if this session has a parent
        const expandParent = (items: DropdownItem[], targetId: string): boolean => {
          for (const item of items) {
            if (item.children) {
              const hasChild = item.children.some(child => child.id === targetId);
              if (hasChild) {
                setExpandedItems(prev => new Set([...Array.from(prev), item.id]));
                return true;
              }
              if (expandParent(item.children, targetId)) {
                setExpandedItems(prev => new Set([...Array.from(prev), item.id]));
                return true;
              }
            }
          }
          return false;
        };
        
        expandParent(sessionsStructure, firstSession.id);
      }
    }
  }, [sessionsStructure, contentData, title, description, difficulty, duration]);

  const handleBackToLessons = () => {
    if (onBack) {
      onBack();
    } else {
      router.push('/learning-lessons');
    }
  };

  const handleSessionSelect = (session: Session) => {
    setSelectedSession(session);
    setIsSessionActive(false);
    setProgress(0);
    setCurrentQuizQuestion(0);
    setQuizAnswers([]);
    setShowQuizResults(false);
  };

  const handleStartSession = () => {
    if (selectedSession) {
      setIsSessionActive(true);
      setProgress(0);
    }
  };

  const handleCompleteSession = () => {
    if (selectedSession) {
      setProgress(100);
      setIsSessionActive(false);
    }
  };

  const handleQuizAnswer = (answerIndex: number) => {
    const newAnswers = [...quizAnswers];
    newAnswers[currentQuizQuestion] = answerIndex;
    setQuizAnswers(newAnswers);
  };

  const handleNextQuizQuestion = () => {
    if (currentContent?.quiz && currentQuizQuestion < currentContent.quiz.questions.length - 1) {
      setCurrentQuizQuestion(currentQuizQuestion + 1);
    }
  };

  const handleQuizSubmit = () => {
    setShowQuizResults(true);
  };

  const resetQuiz = () => {
    setCurrentQuizQuestion(0);
    setQuizAnswers([]);
    setShowQuizResults(false);
  };

  const toggleItem = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const handlePopoverOpenChange = (itemId: string, open: boolean) => {
    if (open) {
      setExpandedItems(new Set([itemId]));
    } else {
      setExpandedItems(new Set());
    }
  };

  const itemContainsId = (item: DropdownItem, targetId: string): boolean => {
    if (!item.children || item.children.length === 0) return item.id === targetId;
    if (item.id === targetId) return true;
    return item.children.some((child) => itemContainsId(child, targetId));
  };

  const isActiveGroup = (item: DropdownItem): boolean => {
    const isOpen = expandedItems.has(item.id);
    if (!selectedDropdownItem) return isOpen;
    const containsSelected = itemContainsId(item, selectedDropdownItem.id);
    return isOpen || containsSelected;
  };

  const handleDropdownItemClick = (item: DropdownItem) => {
    if (item.children) {
      toggleItem(item.id);
    } else {
      setSelectedDropdownItem(item);
      const content = contentData[item.id];
      if (content) {
        setCurrentContent(content);
        setSelectedSession({
          id: item.id,
          title: content.title,
          description: content.description,
          duration: '15:00',
          type: 'video',
          isActive: false,
          isCompleted: false,
          videoUrl: content.videoUrl
        });
        // Keep the parent dropdown open when a child item is selected
        // Only close other dropdowns, but keep the current parent open
        const parentId = findParentId(sessionsStructure, item.id);
        if (parentId) {
          setExpandedItems(new Set([parentId]));
        } else {
          // If no parent found, just close all dropdowns
          setExpandedItems(new Set());
        }
      }
    }
  };

  const handleNextSession = () => {
    const getAllSessions = (items: DropdownItem[]): DropdownItem[] => {
      return items.flatMap(item => (item.children && item.children.length > 0) ? getAllSessions(item.children) : item);
    };
    const flatSessions = getAllSessions(sessionsStructure);
    const currentIndex = flatSessions.findIndex(session => session.id === selectedSession?.id);
    if (currentIndex !== -1 && currentIndex < flatSessions.length - 1) {
      handleDropdownItemClick(flatSessions[currentIndex + 1]);
    }
  };

  const handlePreviousSession = () => {
    const getAllSessions = (items: DropdownItem[]): DropdownItem[] => {
      return items.flatMap(item => (item.children && item.children.length > 0) ? getAllSessions(item.children) : item);
    };
    const flatSessions = getAllSessions(sessionsStructure);
    const currentIndex = flatSessions.findIndex(session => session.id === selectedSession?.id);
    if (currentIndex > 0) {
      handleDropdownItemClick(flatSessions[currentIndex - 1]);
    }
  };

  // Helper function to find the parent ID of a child item
  const findParentId = (items: DropdownItem[], childId: string): string | null => {
    for (const item of items) {
      if (item.children) {
        const hasChild = item.children.some(child => child.id === childId);
        if (hasChild) {
          return item.id;
        }
        // Recursively search in nested children
        const found = findParentId(item.children, childId);
        if (found) {
          return found;
        }
      }
    }
    return null;
  };

  const renderDropdownItem = (item: DropdownItem, level: number = 0) => {
    const isExpanded = expandedItems.has(item.id);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.id} className="w-full">
        <div
          className={`flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
            level > 0 ? 'pl-6' : ''
          } ${selectedDropdownItem?.id === item.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
          onClick={() => handleDropdownItemClick(item)}
        >
          <div className="flex items-center space-x-2">
            {hasChildren ? (
              <ChevronDown
                className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              />
            ) : (
              <div className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">{item.title}</span>
          </div>
          {!hasChildren && (
            <div className="flex items-center space-x-2">
              <Clock className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-500">15:00</span>
            </div>
          )}
        </div>
        {hasChildren && isExpanded && (
          <div className="border-l border-gray-200 ml-4">
            {item.children?.map((child) => renderDropdownItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 mx-auto relative">
        {/* Back to Lessons button - positioned in the left white space */}
        <div className="absolute left-0 top-6 -ml-64 w-64 flex justify-center items-center">
          {/* <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToLessons}
            className="flex items-center space-x-2 ml-14"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Lessons</span>
          </Button> */}
        </div>

        {/* Header */}
        <div className="mb-6">
          {/* Title and badges row */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              <p className="text-gray-600">{description}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">
                {sessionsStructure.reduce((total, item) => {
                  return total + (item.children ? item.children.length : 1);
                }, 0)} Sessions
              </Badge>
              <Badge className={getDifficultyColor(difficulty)}>{difficulty}</Badge>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {navigationStyle === 'horizontal' ? (
          <div className="space-y-6">
            {/* Horizontal Navigation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5" />
                  <span>Course Content</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div ref={dropdownRef} className="flex flex-wrap gap-3 p-4 border-t justify-end">
                  {sessionsStructure.map((item) => {
                    if (item.children) {
                      return (
                        <Popover key={item.id} open={expandedItems.has(item.id)} onOpenChange={(open) => handlePopoverOpenChange(item.id, open)}>
                          <PopoverTrigger asChild>
                            <Button
                              variant={isActiveGroup(item) ? "default" : "outline"}
                              size="sm"
                              className={`flex items-center space-x-2 ${isActiveGroup(item) ? 'bg-black text-white hover:bg-black' : ''}`}
                            >
                              <BookOpen className="w-4 h-4" />
                              <span>{item.title}</span>
                              <ChevronDown
                                className={`w-3 h-3 transition-transform ${expandedItems.has(item.id) ? 'rotate-180' : ''}`}
                              />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent align="end" sideOffset={8} className="w-72 p-1 max-h-56 overflow-y-auto">
                            {item.children.map((child) => (
                              <Button
                                key={child.id}
                                variant={selectedDropdownItem?.id === child.id ? "default" : "ghost"}
                                size="sm"
                                onClick={() => handleDropdownItemClick(child)}
                                className={`w-full justify-start text-left h-8 text-sm hover:bg-gray-50 ${selectedDropdownItem?.id === child.id ? 'bg-black text-white hover:bg-black' : ''}`}
                              >
                                <BookOpen className="w-3 h-3 mr-2" />
                                <span className="truncate">{child.title}</span>
                                <Clock className="w-3 h-3 ml-auto flex-shrink-0" />
                              </Button>
                            ))}
                          </PopoverContent>
                        </Popover>
                      );
                    } else {
                      return (
                        <Button
                          key={item.id}
                          variant={selectedDropdownItem?.id === item.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleDropdownItemClick(item)}
                          className="flex items-center space-x-2"
                        >
                          <BookOpen className="w-4 h-4" />
                          <span>{item.title}</span>
                          <Clock className="w-3 h-3" />
                        </Button>
                      );
                    }
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Content Area */}
            {selectedSession && currentContent ? (
              <div className="space-y-6">
                {/* Session Header */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">{currentContent.title}</CardTitle>
                        <p className="text-gray-600 mt-1">{currentContent.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{selectedSession.duration}</Badge>
                        <Badge variant="secondary">{selectedSession.type}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* Video Player Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Youtube className="w-5 h-5 text-red-500" />
                      <span>Video Lesson</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {currentContent.videoUrl ? (
                      <div className="aspect-video w-full">
                        <iframe
                          src={currentContent.videoUrl}
                          title={currentContent.title}
                          className="w-full h-full rounded-lg"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <BaseVideoPlayer
                        title={currentContent.title}
                        description={currentContent.description}
                        duration={selectedSession.duration}
                        className="w-full"
                      />
                    )}
                  </CardContent>
                </Card>

                {/* Content */}
                <Card>
                  <CardHeader>
                    <CardTitle>Content</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">{currentContent.content}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Objectives */}
                {currentContent.objectives.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Learning Objectives</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {currentContent.objectives.map((objective, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{objective}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Key Points */}
                {currentContent.keyPoints.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Key Points</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentContent.keyPoints.map((point, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                            <span className="text-gray-700">{point}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Quiz */}
                {currentContent.quiz && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Quiz</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {!showQuizResults ? (
                        <div className="space-y-4">
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <h3 className="font-semibold mb-2">
                              Question {currentQuizQuestion + 1} of {currentContent.quiz!.questions.length}
                            </h3>
                            <p className="text-gray-700 mb-4">
                              {currentContent.quiz!.questions[currentQuizQuestion].question}
                            </p>
                            <div className="space-y-2">
                              {currentContent.quiz!.questions[currentQuizQuestion].options.map((option, index) => (
                                <button
                                  key={index}
                                  onClick={() => handleQuizAnswer(index)}
                                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                                    quizAnswers[currentQuizQuestion] === index
                                      ? 'border-blue-500 bg-blue-50'
                                      : 'border-gray-200 hover:border-gray-300'
                                  }`}
                                >
                                  {option}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <Button
                              variant="outline"
                              onClick={resetQuiz}
                              disabled={currentQuizQuestion === 0}
                            >
                              Reset
                            </Button>
                            {currentQuizQuestion < currentContent.quiz!.questions.length - 1 ? (
                              <Button onClick={handleNextQuizQuestion}>
                                Next Question
                              </Button>
                            ) : (
                              <Button onClick={handleQuizSubmit}>
                                Submit Quiz
                              </Button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="p-4 bg-green-50 rounded-lg">
                            <h3 className="font-semibold text-green-800 mb-2">Quiz Results</h3>
                            <p className="text-green-700">
                              You scored {quizAnswers.filter((answer, index) => 
                                answer === currentContent.quiz!.questions[index].correctAnswer
                              ).length} out of {currentContent.quiz!.questions.length} correctly!
                            </p>
                          </div>
                          <Button onClick={resetQuiz}>Retake Quiz</Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Action Buttons */}
                <div className="flex justify-between">
                  <Button variant="outline" onClick={handleBackToLessons}>
                    Back to Lessons
                  </Button>
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={handlePreviousSession}>
                      Previous Session
                    </Button>
                    <Button onClick={handleNextSession}>
                      Next Session
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Select a Session
                  </h3>
                  <p className="text-gray-600">
                    Choose a session from the navigation bar above to begin learning.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="w-5 h-5" />
                    <span>Course Content</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-96 overflow-y-auto">
                    {sessionsStructure.map((item) => renderDropdownItem(item))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {selectedSession && currentContent ? (
                <div className="space-y-6">
                  {/* Session Header */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-xl">{currentContent.title}</CardTitle>
                          <p className="text-gray-600 mt-1">{currentContent.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{selectedSession.duration}</Badge>
                          <Badge variant="secondary">{selectedSession.type}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>

                  {/* Video Player Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Youtube className="w-5 h-5 text-red-500" />
                        <span>Video Lesson</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {currentContent.videoUrl ? (
                        <div className="aspect-video w-full">
                          <iframe
                            src={currentContent.videoUrl}
                            title={currentContent.title}
                            className="w-full h-full rounded-lg"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      ) : (
                        <BaseVideoPlayer
                          title={currentContent.title}
                          description={currentContent.description}
                          duration={selectedSession.duration}
                          className="w-full"
                        />
                      )}
                    </CardContent>
                  </Card>

                  {/* Content */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Content</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose max-w-none">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">{currentContent.content}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Objectives */}
                  {currentContent.objectives.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Learning Objectives</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {currentContent.objectives.map((objective, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">{objective}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {/* Key Points */}
                  {currentContent.keyPoints.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Key Points</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {currentContent.keyPoints.map((point, index) => (
                            <div key={index} className="flex items-start space-x-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                              <span className="text-gray-700">{point}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Quiz */}
                  {currentContent.quiz && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Quiz</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {!showQuizResults ? (
                          <div className="space-y-4">
                            <div className="p-4 bg-gray-50 rounded-lg">
                              <h3 className="font-semibold mb-2">
                                Question {currentQuizQuestion + 1} of {currentContent.quiz!.questions.length}
                              </h3>
                              <p className="text-gray-700 mb-4">
                                {currentContent.quiz!.questions[currentQuizQuestion].question}
                              </p>
                              <div className="space-y-2">
                                {currentContent.quiz!.questions[currentQuizQuestion].options.map((option, index) => (
                                  <button
                                    key={index}
                                    onClick={() => handleQuizAnswer(index)}
                                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                                      quizAnswers[currentQuizQuestion] === index
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                  >
                                    {option}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="flex justify-between">
                              <Button
                                variant="outline"
                                onClick={resetQuiz}
                                disabled={currentQuizQuestion === 0}
                              >
                                Reset
                              </Button>
                              {currentQuizQuestion < currentContent.quiz!.questions.length - 1 ? (
                                <Button onClick={handleNextQuizQuestion}>
                                  Next Question
                                </Button>
                              ) : (
                                <Button onClick={handleQuizSubmit}>
                                  Submit Quiz
                                </Button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="p-4 bg-green-50 rounded-lg">
                              <h3 className="font-semibold text-green-800 mb-2">Quiz Results</h3>
                              <p className="text-green-700">
                                You scored {quizAnswers.filter((answer, index) => 
                                  answer === currentContent.quiz!.questions[index].correctAnswer
                                ).length} out of {currentContent.quiz!.questions.length} correctly!
                              </p>
                            </div>
                            <Button onClick={resetQuiz}>Retake Quiz</Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={handleBackToLessons}>
                      Back to Lessons
                    </Button>
                    <div className="flex space-x-2">
                      <Button variant="outline" onClick={handlePreviousSession}>
                        Previous Session
                      </Button>
                      <Button onClick={handleNextSession}>
                        Next Session
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Select a Session
                    </h3>
                    <p className="text-gray-600">
                      Choose a session from the sidebar to begin learning.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export { BaseLearningMaterial };