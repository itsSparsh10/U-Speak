import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { AuditLog } from '@/lib/models';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    // Extract and verify the token
    const token = getTokenFromHeader(authHeader);
    if (!token) {
      return NextResponse.json(
        { error: 'Invalid token format' },
        { status: 401 }
      );
    }

    // Verify the token to get user information
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Check if this is a special admin logout from employee session
    try {
      const body = await request.json();
      if (body.actionType === 'ADMIN_LOGOUT_FROM_EMPLOYEE' && body.employeeId && body.adminId) {
        // Log the special admin logout from employee action
        try {
          if (payload.corporateAccountId) {
            await AuditLog.create({
              performedByUserId: body.adminId,
              corporateAccountId: payload.corporateAccountId,
              actionType: 'ADMIN_LOGOUT_FROM_EMPLOYEE',
              targetUserId: body.employeeId,
              details: `Admin ${payload.email} logged out from employee session`,
              ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
              userAgent: request.headers.get('user-agent') || 'unknown'
            });
          }
        } catch (auditError) {
          console.error('Failed to log admin logout from employee:', auditError);
        }
        
        return NextResponse.json({
          success: true,
          message: 'Admin logged out from employee session successfully'
        });
      }
    } catch (parseError) {
      // If request body parsing fails, continue with normal logout
      console.log('Request body parsing failed, continuing with normal logout');
    }

    // Log the logout action
    try {
      if (payload.corporateAccountId) {
        // Determine specific action type based on user role
        let actionType = 'LOGOUT';
        if (payload.role === 'ADMIN' || payload.role === 'CORPORATE_ADMIN') {
          actionType = 'ADMIN_LOGOUT';
        } else if (payload.role === 'EMPLOYEE' || payload.role === 'CORPORATE_USER') {
          actionType = 'EMPLOYEE_LOGOUT';
        } else {
          actionType = 'USER_LOGOUT';
        }
        
        await AuditLog.create({
          performedByUserId: payload.userId,
          corporateAccountId: payload.corporateAccountId,
          actionType: actionType,
          details: `${payload.role === 'ADMIN' || payload.role === 'CORPORATE_ADMIN' ? 'Admin' : payload.role === 'EMPLOYEE' || payload.role === 'CORPORATE_USER' ? 'Employee' : 'User'} ${payload.email} logged out successfully`,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        });
      } else {
        console.log('Skipping logout audit log - user has no corporate account');
      }
    } catch (auditError) {
      console.error('Failed to log logout action:', auditError);
      // Don't fail logout if audit log fails
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}
