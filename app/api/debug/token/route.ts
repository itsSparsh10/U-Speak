import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get token from header
    const authHeader = request.headers.get('authorization');
    const token = getTokenFromHeader(authHeader || '');

    if (!token) {
      return NextResponse.json({
        error: 'No token provided',
        hasAuthHeader: !!authHeader,
        authHeaderValue: authHeader ? authHeader.substring(0, 20) + '...' : null
      }, { status: 401 });
    }

    // Try to verify the token
    const decoded = await verifyToken(token);

    if (!decoded) {
      return NextResponse.json({
        error: 'Token verification failed',
        tokenLength: token.length,
        tokenPreview: token.substring(0, 20) + '...'
      }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      decoded: {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        corporateAccountId: decoded.corporateAccountId,
        firstName: decoded.firstName,
        lastName: decoded.lastName
      }
    });

  } catch (error: any) {
    return NextResponse.json({
      error: 'Debug endpoint error',
      message: error.message
    }, { status: 500 });
  }
}
