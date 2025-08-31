'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const scoreData = [
  {
    title: 'Body Language Score',
    score: 82,
    previousScore: 78,
    icon: '🤝',
    gradient: 'from-emerald-400 to-teal-500',
    bgGradient: 'from-emerald-50 to-teal-50'
  },
  {
    title: 'Vocal Tone Score',
    score: 75,
    previousScore: 73,
    icon: '🎤',
    gradient: 'from-blue-400 to-indigo-500',
    bgGradient: 'from-blue-50 to-indigo-50'
  },
  {
    title: 'Word Power Score',
    score: 77,
    previousScore: 79,
    icon: '💬',
    gradient: 'from-purple-400 to-pink-500',
    bgGradient: 'from-purple-50 to-pink-50'
  }
];

export function ScoreCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {scoreData.map((item, index) => {
        const change = item.score - item.previousScore;
        const isImproving = change > 0;
        const isStable = change === 0;

        return (
          <Card key={index} className={`bg-gradient-to-br ${item.bgGradient} border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-gray-700">
                {item.title}
              </CardTitle>
              <div className={`text-3xl p-2 rounded-full bg-gradient-to-r ${item.gradient} shadow-lg`}>
                <span className="filter drop-shadow-sm">{item.icon}</span>
              </div>
            </CardHeader>
            <CardContent className="bg-white/60 backdrop-blur-sm rounded-lg mx-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-4xl font-bold bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent`}>
                    {item.score}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">out of 100</div>
                </div>
                <div className="flex items-center space-x-1 bg-white/80 px-3 py-1 rounded-full shadow-md">
                  {isStable ? (
                    <Minus className="w-5 h-5 text-gray-500" />
                  ) : isImproving ? (
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-500" />
                  )}
                  <span className={`text-sm font-semibold ${
                    isStable ? 'text-gray-400' : 
                    isImproving ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {isStable ? '0' : (isImproving ? '+' : '')}{change}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}