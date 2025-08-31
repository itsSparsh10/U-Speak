'use client';

import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { VideoReport } from '@/components/videos/video-report';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface VideoReportPageProps {
  video: {
    id: string;
    title: string;
    speaker: string;
    uploadDate: string;
    duration: string;
    overallScore: number;
    bodyLanguageScore: number;
    vocalToneScore: number;
    wordPowerScore: number;
    thumbnail?: string;
  };
}

export function VideoReportPage({ video }: VideoReportPageProps) {
  const router = useRouter();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Videos</span>
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Video Analysis Report</h1>
        </div>
        <VideoReport video={video} onClose={() => router.back()} />
      </div>
    </DashboardLayout>
  );
}