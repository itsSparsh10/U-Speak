/**
 * Sample Data Seeding Script for USpeak Pro 4.4 Reporting & Analytics
 * This script generates realistic test data for demonstration purposes
 */

import connectDB from '@/lib/mongodb';
import { 
  LessonActivity, 
  VideoUploadActivity, 
  EmployeeScoreHistory, 
  EngagementSummary 
} from '@/lib/models';

// Sample departments and positions
const DEPARTMENTS = [
  'Engineering', 'Sales', 'Marketing', 'Customer Success', 
  'HR', 'Finance', 'Operations', 'Product'
];

const POSITIONS = [
  'Junior', 'Mid-Level', 'Senior', 'Team Lead', 'Manager', 'Director'
];

const LOCATIONS = [
  'New York', 'San Francisco', 'Chicago', 'Austin', 'Boston', 
  'Los Angeles', 'Seattle', 'Denver', 'Remote'
];

// Sample lesson types
const LESSON_TYPES = [
  'Public Speaking Fundamentals',
  'Presentation Skills',
  'Voice Projection',
  'Body Language',
  'Executive Communication',
  'Team Meeting Skills',
  'Interview Techniques',
  'Confidence Building',
  'Storytelling',
  'Technical Presentations'
];

export class DataSeeder {
  private employeeIds: string[] = [];
  private accountId: string;

  constructor(accountId: string) {
    this.accountId = accountId;
  }

  /**
   * Generate sample employee IDs (these should match existing EmployeeProfile records)
   */
  generateEmployeeIds(count: number = 50): string[] {
    this.employeeIds = Array.from({ length: count }, (_, i) => 
      `employee_${String(i + 1).padStart(3, '0')}`
    );
    return this.employeeIds;
  }

  /**
   * Generate random date within range
   */
  randomDate(start: Date, end: Date): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }

  /**
   * Generate lesson activities for the past 90 days
   */
  async generateLessonActivities(days: number = 90): Promise<void> {
    console.log('Generating lesson activities...');
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const activities = [];

    for (const employeeId of this.employeeIds) {
      // Each employee completes 1-3 lessons per week on average
      const lessonsPerWeek = Math.random() * 2 + 1;
      const totalLessons = Math.floor((days / 7) * lessonsPerWeek);

      for (let i = 0; i < totalLessons; i++) {
        const completedAt = this.randomDate(startDate, endDate);
        const durationMinutes = Math.floor(Math.random() * 45) + 15; // 15-60 minutes
        const lessonType = LESSON_TYPES[Math.floor(Math.random() * LESSON_TYPES.length)];

        activities.push({
          employeeId,
          accountId: this.accountId,
          lessonId: `lesson_${Math.floor(Math.random() * 100) + 1}`,
          lessonTitle: lessonType,
          moduleId: `module_${Math.floor(Math.random() * 20) + 1}`,
          durationMinutes,
          completedAt,
          createdAt: completedAt,
          updatedAt: completedAt
        });
      }
    }

    // Batch insert
    if (activities.length > 0) {
      await LessonActivity.insertMany(activities);
      console.log(`Created ${activities.length} lesson activities`);
    }
  }

  /**
   * Generate video upload activities
   */
  async generateVideoUploadActivities(days: number = 90): Promise<void> {
    console.log('Generating video upload activities...');
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const activities = [];

    for (const employeeId of this.employeeIds) {
      // Not all employees upload videos regularly
      const isActiveUploader = Math.random() > 0.4; // 60% upload videos
      if (!isActiveUploader) continue;

      // Active uploaders upload 1-2 videos per month
      const videosPerMonth = Math.random() * 1.5 + 0.5;
      const totalVideos = Math.floor((days / 30) * videosPerMonth);

      for (let i = 0; i < totalVideos; i++) {
        const uploadedAt = this.randomDate(startDate, endDate);
        const durationSeconds = Math.floor(Math.random() * 180) + 30; // 30-210 seconds
        const fileSize = Math.floor(Math.random() * 50) + 5; // 5-55 MB

        activities.push({
          employeeId,
          accountId: this.accountId,
          lessonId: `lesson_${Math.floor(Math.random() * 100) + 1}`,
          videoUrl: `https://example.com/videos/${employeeId}_${i}.mp4`,
          durationSeconds,
          fileSize,
          uploadedAt,
          createdAt: uploadedAt,
          updatedAt: uploadedAt
        });
      }
    }

    if (activities.length > 0) {
      await VideoUploadActivity.insertMany(activities);
      console.log(`Created ${activities.length} video upload activities`);
    }
  }

  /**
   * Generate employee score history with realistic progression
   */
  async generateEmployeeScoreHistory(days: number = 90): Promise<void> {
    console.log('Generating employee score history...');
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const scoreHistories = [];

    for (const employeeId of this.employeeIds) {
      // Generate baseline score and improvement trajectory
      const baselineScore = Math.random() * 30 + 40; // 40-70 starting score
      const improvementRate = (Math.random() - 0.3) * 0.3; // Some improve, some stay same, few decline
      const scoreVariability = 5; // ±5 points variation

      // Each employee gets scored 1-2 times per week
      const scoresPerWeek = Math.random() * 1 + 1;
      const totalScores = Math.floor((days / 7) * scoresPerWeek);

      for (let i = 0; i < totalScores; i++) {
        const scoredAt = this.randomDate(startDate, endDate);
        const daysSinceStart = (scoredAt.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
        
        // Calculate score with improvement over time plus randomness
        const trendScore = baselineScore + (improvementRate * daysSinceStart);
        const variation = (Math.random() - 0.5) * scoreVariability;
        let finalScore = Math.max(0, Math.min(100, trendScore + variation));
        
        // Round to 1 decimal place
        finalScore = Math.round(finalScore * 10) / 10;

        scoreHistories.push({
          employeeId,
          accountId: this.accountId,
          score: finalScore,
          lessonId: `lesson_${Math.floor(Math.random() * 100) + 1}`,
          assessmentType: Math.random() > 0.7 ? 'formal' : 'practice',
          scoredAt,
          createdAt: scoredAt,
          updatedAt: scoredAt
        });
      }
    }

    if (scoreHistories.length > 0) {
      await EmployeeScoreHistory.insertMany(scoreHistories);
      console.log(`Created ${scoreHistories.length} score history records`);
    }
  }

  /**
   * Generate daily engagement summaries using the ETL logic
   */
  async generateEngagementSummaries(days: number = 90): Promise<void> {
    console.log('Generating engagement summaries...');
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const summaries = [];

    // Process each day
    for (let d = 0; d < days; d++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + d);
      const nextDate = new Date(currentDate);
      nextDate.setDate(nextDate.getDate() + 1);

      // For each employee, aggregate their daily activity
      for (const employeeId of this.employeeIds) {
        // Check if employee had any activity on this day (not all employees active every day)
        const hasActivity = Math.random() > 0.7; // 30% chance of activity per day
        if (!hasActivity) continue;

        // Generate daily metrics
        const lessonsCompleted = Math.floor(Math.random() * 3); // 0-2 lessons per day
        const videosUploaded = Math.random() > 0.8 ? 1 : 0; // 20% chance of video upload
        const timeSpentMinutes = lessonsCompleted * (Math.random() * 30 + 15); // 15-45 min per lesson
        const avgScore = lessonsCompleted > 0 ? Math.random() * 30 + 50 : null; // 50-80 if they completed lessons
        
        // Assign random attributes
        const department = DEPARTMENTS[Math.floor(Math.random() * DEPARTMENTS.length)];
        const position = POSITIONS[Math.floor(Math.random() * POSITIONS.length)];
        const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];

        summaries.push({
          employeeId,
          accountId: this.accountId,
          date: new Date(currentDate),
          lessonsCompleted,
          videosUploaded,
          timeSpentMinutes: Math.round(timeSpentMinutes),
          avgScore: avgScore ? Math.round(avgScore * 10) / 10 : null,
          scoreCount: avgScore ? lessonsCompleted : 0,
          firstActivity: hasActivity ? currentDate : null,
          lastActivity: hasActivity ? currentDate : null,
          attributes: [
            { position: 'position1', name: 'Department', value: department },
            { position: 'position2', name: 'Level', value: position },
            { position: 'position3', name: 'Location', value: location }
          ],
          lastUpdated: new Date()
        });
      }
    }

    if (summaries.length > 0) {
      await EngagementSummary.insertMany(summaries);
      console.log(`Created ${summaries.length} engagement summary records`);
    }
  }

  /**
   * Clean existing data before seeding
   */
  async cleanExistingData(): Promise<void> {
    console.log('Cleaning existing data...');
    
    await Promise.all([
      LessonActivity.deleteMany({ accountId: this.accountId }),
      VideoUploadActivity.deleteMany({ accountId: this.accountId }),
      EmployeeScoreHistory.deleteMany({ accountId: this.accountId }),
      EngagementSummary.deleteMany({ accountId: this.accountId })
    ]);
    
    console.log('Existing data cleaned');
  }

  /**
   * Run the complete seeding process
   */
  async seedAll(options: {
    days?: number;
    employeeCount?: number;
    clean?: boolean;
  } = {}): Promise<void> {
    const { days = 90, employeeCount = 50, clean = true } = options;
    
    console.log(`Starting data seeding for ${employeeCount} employees over ${days} days...`);
    
    await connectDB();
    
    if (clean) {
      await this.cleanExistingData();
    }
    
    this.generateEmployeeIds(employeeCount);
    
    await Promise.all([
      this.generateLessonActivities(days),
      this.generateVideoUploadActivities(days),
      this.generateEmployeeScoreHistory(days)
    ]);
    
    await this.generateEngagementSummaries(days);
    
    console.log('Data seeding completed successfully!');
  }

  /**
   * Get seeding statistics
   */
  async getStats(): Promise<{
    lessonActivities: number;
    videoActivities: number;
    scoreHistories: number;
    engagementSummaries: number;
    dateRange: { start: Date; end: Date };
  }> {
    const [lessonCount, videoCount, scoreCount, summaryCount] = await Promise.all([
      LessonActivity.countDocuments({ accountId: this.accountId }),
      VideoUploadActivity.countDocuments({ accountId: this.accountId }),
      EmployeeScoreHistory.countDocuments({ accountId: this.accountId }),
      EngagementSummary.countDocuments({ accountId: this.accountId })
    ]);

    const earliestSummary = await EngagementSummary.findOne(
      { accountId: this.accountId }, 
      {}, 
      { sort: { date: 1 } }
    );
    
    const latestSummary = await EngagementSummary.findOne(
      { accountId: this.accountId }, 
      {}, 
      { sort: { date: -1 } }
    );

    return {
      lessonActivities: lessonCount,
      videoActivities: videoCount,
      scoreHistories: scoreCount,
      engagementSummaries: summaryCount,
      dateRange: {
        start: (earliestSummary as any)?.date || new Date(),
        end: (latestSummary as any)?.date || new Date()
      }
    };
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  const accountId = args[1] || 'default_account_id';

  const seeder = new DataSeeder(accountId);

  switch (command) {
    case 'seed':
      const days = parseInt(args[2]) || 90;
      const employeeCount = parseInt(args[3]) || 50;
      const clean = args[4] !== 'false';
      
      seeder.seedAll({ days, employeeCount, clean })
        .then(() => process.exit(0))
        .catch(err => {
          console.error('Seeding failed:', err);
          process.exit(1);
        });
      break;

    case 'stats':
      seeder.getStats()
        .then(stats => {
          console.log('Seeding Statistics:', JSON.stringify(stats, null, 2));
          process.exit(0);
        })
        .catch(err => {
          console.error('Stats failed:', err);
          process.exit(1);
        });
      break;

    case 'clean':
      seeder.cleanExistingData()
        .then(() => process.exit(0))
        .catch(err => {
          console.error('Cleanup failed:', err);
          process.exit(1);
        });
      break;

    default:
      console.log(`
Usage: node data-seeder.js <command> <accountId> [options]

Commands:
  seed <accountId> [days] [employeeCount] [clean]  Generate sample data
  stats <accountId>                                Show data statistics  
  clean <accountId>                                Clean existing data

Examples:
  node data-seeder.js seed acc123 90 50 true     # 90 days, 50 employees, clean first
  node data-seeder.js stats acc123               # Show statistics
  node data-seeder.js clean acc123               # Clean data only
      `);
      process.exit(1);
  }
}
