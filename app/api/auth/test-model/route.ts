import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User } from '@/lib/models';

export async function GET() {
  try {
    console.log('Testing User model...');
    
    await connectDB();
    console.log('Database connected');
    
    // Test basic User model functionality
    console.log('User model type:', typeof User);
    console.log('User model:', User);
    
    // Try to find any user
    const userCount = await User.countDocuments();
    console.log('Total users in database:', userCount);
    
    // Try to find the test user
    const testUser = await User.findOne({ email: 'admin@testcompany.com' });
    console.log('Test user found:', testUser ? 'Yes' : 'No');
    
    if (testUser) {
      console.log('Test user data:', {
        id: testUser._id,
        email: testUser.email,
        role: testUser.role,
        status: testUser.status
      });
    }
    
    return NextResponse.json({
      success: true,
      userCount,
      testUserExists: !!testUser,
      modelType: typeof User
    });
    
  } catch (error) {
    console.error('Test model error:', error);
    return NextResponse.json(
      { error: 'Test failed', details: error.message },
      { status: 500 }
    );
  }
}
