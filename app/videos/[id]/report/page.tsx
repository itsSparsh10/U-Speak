import { notFound } from 'next/navigation';
import { VideoReportPage } from '@/components/videos/video-report-page';

// Generate static params for static export
export async function generateStaticParams() {
  // Return the video IDs that should be pre-generated
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
  ];
}

// Mock video data - in a real app, you'd fetch this based on the ID
const getVideoById = (id: string) => {
  const mockVideos = {
    '1': {
      id: '1',
      title: 'Quarterly Sales Presentation',
      speaker: 'John Smith',
      uploadDate: '2024-01-15',
      duration: '12:34',
      overallScore: 78,
      bodyLanguageScore: 82,
      vocalToneScore: 75,
      wordPowerScore: 77,
      thumbnail: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    '2': {
      id: '2',
      title: 'Product Launch Demo',
      speaker: 'Sarah Johnson',
      uploadDate: '2024-01-12',
      duration: '18:45',
      overallScore: 85,
      bodyLanguageScore: 88,
      vocalToneScore: 82,
      wordPowerScore: 85,
      thumbnail: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    '3': {
      id: '3',
      title: 'Team Meeting Facilitation',
      speaker: 'Mike Davis',
      uploadDate: '2024-01-10',
      duration: '25:12',
      overallScore: 72,
      bodyLanguageScore: 70,
      vocalToneScore: 74,
      wordPowerScore: 72,
      thumbnail: 'https://images.pexels.com/photos/3184287/pexels-photo-3184287.jpeg?auto=compress&cs=tinysrgb&w=400'
    }
  };

  const video = mockVideos[id as keyof typeof mockVideos];
  if (!video) {
    notFound();
  }
  return video;
};

interface PageProps {
  params: {
    id: string;
  };
}

export default function ReportPage({ params }: PageProps) {
  const video = getVideoById(params.id);
  
  return <VideoReportPage video={video} />;
}