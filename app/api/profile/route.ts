import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User, CorporateAccount } from '@/lib/models';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const authHeader = request.headers.get('authorization') || '';
    const token = getTokenFromHeader(authHeader);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = payload.userId;
    const body = await request.json();
    const { firstName, lastName, companyName } = body;

    // Basic validation
    const updates: any = {};
    if (firstName && String(firstName).trim().length > 0) updates.firstName = String(firstName).trim();
    if (lastName && String(lastName).trim().length > 0) updates.lastName = String(lastName).trim();

    // Update user
    const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true }).lean();
    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let updatedCorporate: any = null;
    // If companyName provided and user is corporate admin, update corporate account
    if (companyName && payload.role === 'CORPORATE_ADMIN') {
      try {
        updatedCorporate = await CorporateAccount.findByIdAndUpdate(
          updatedUser.corporateAccountId,
          { companyName: String(companyName).trim() },
          { new: true }
        ).lean();
      } catch (e) {
        console.error('Error updating corporate account:', e);
      }
    }

    // Sanitize response
    const safeUser = {
      id: (updatedUser._id as any).toString(),
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      role: updatedUser.role
    };

    const safeCorp = updatedCorporate ? {
      id: (updatedCorporate._id as any).toString(),
      companyName: updatedCorporate.companyName,
      subscriptionPlan: updatedCorporate.subscriptionPlan
    } : null;

    return NextResponse.json({ success: true, user: safeUser, corporateAccount: safeCorp });

  } catch (error: any) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Internal server error', details: String(error.message || error) }, { status: 500 });
  }
}
