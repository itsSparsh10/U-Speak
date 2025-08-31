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

    // Get the user to find their corporate account
    const user = await User.findById(userId).lean();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let updatedCorporate: any = null;
    let updatedUser = user;

    // If firstName or lastName provided, update corporate account (for admins)
    if ((firstName || lastName) && payload.role === 'CORPORATE_ADMIN' && user.account_id) {
      try {
        const updates: any = {};
        if (firstName && String(firstName).trim().length > 0) updates.firstName = String(firstName).trim();
        if (lastName && String(lastName).trim().length > 0) updates.lastName = String(lastName).trim();

        updatedCorporate = await CorporateAccount.findByIdAndUpdate(
          user.account_id,
          updates,
          { new: true }
        ).lean();
      } catch (e) {
        console.error('Error updating corporate account:', e);
      }
    }

    // If companyName provided and user is corporate admin, update corporate account
    if (companyName && payload.role === 'CORPORATE_ADMIN' && user.account_id) {
      try {
        updatedCorporate = await CorporateAccount.findByIdAndUpdate(
          user.account_id,
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
      role: updatedUser.role
    };

    const safeCorp = updatedCorporate ? {
      id: (updatedCorporate._id as any).toString(),
      companyName: updatedCorporate.companyName,
      subscriptionPlan: updatedCorporate.subscriptionPlan,
      firstName: updatedCorporate.firstName,
      lastName: updatedCorporate.lastName
    } : null;

    return NextResponse.json({ success: true, user: safeUser, corporateAccount: safeCorp });

  } catch (error: any) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Internal server error', details: String(error.message || error) }, { status: 500 });
  }
}
