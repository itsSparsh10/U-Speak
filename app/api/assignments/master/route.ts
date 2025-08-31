import { NextRequest, NextResponse } from 'next/server';
import { AssignmentMaster } from '@/lib/models';
import connectDB from '@/lib/mongodb';

// GET /api/assignments/master - Get all assignment masters
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const difficulty = searchParams.get('difficulty');
    const active = searchParams.get('active');
    const search = searchParams.get('search');
    
    let query: any = {};
    
    if (type) query.assignment_type = type;
    if (difficulty) query.difficulty_level = difficulty;
    if (active !== null) query.is_active = active === 'true';
    if (search) {
      query.$text = { $search: search };
    }
    
    const assignments = await AssignmentMaster.find(query)
      .sort({ created_at: -1 })
      .lean();
    
    return NextResponse.json({ success: true, data: assignments });
  } catch (error: any) {
    console.error('Error fetching assignment masters:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch assignments' },
      { status: 500 }
    );
  }
}

// POST /api/assignments/master - Create new assignment master
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { title, description, assignment_type, estimated_duration, difficulty_level, tags } = body;
    
    if (!title || !description || !assignment_type) {
      return NextResponse.json(
        { success: false, error: 'Title, description, and assignment_type are required' },
        { status: 400 }
      );
    }
    
    const assignment = new AssignmentMaster({
      title,
      description,
      assignment_type,
      estimated_duration,
      difficulty_level,
      tags: tags || []
    });
    
    await assignment.save();
    
    return NextResponse.json({ success: true, data: assignment }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating assignment master:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create assignment' },
      { status: 500 }
    );
  }
}
