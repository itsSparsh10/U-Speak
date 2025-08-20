import { SignJWT, jwtVerify } from 'jose';
import { IUser, IAdmin } from './models';
import mongoose from 'mongoose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production-change-this-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  corporateAccountId?: string; // Make optional
  firstName: string;
  lastName: string;
  [key: string]: any; // Add index signature for jose compatibility
}

// Union type for both User and Admin models
type AuthUser = IUser | IAdmin;

export async function generateToken(user: AuthUser): Promise<string> {
  // Extract the actual ObjectId from corporateAccountId whether it's populated or not
  let corporateAccountId: string | undefined;
  
  if (user.corporateAccountId) {
    if (typeof user.corporateAccountId === 'object' && user.corporateAccountId._id) {
      // If populated, get the _id
      corporateAccountId = (user.corporateAccountId as any)._id.toString();
    } else {
      // If not populated, use the ID directly
      corporateAccountId = (user.corporateAccountId as mongoose.Types.ObjectId).toString();
    }
  } else {
    // Handle case where corporateAccountId is null/undefined
    console.warn(`Warning: User ${user.email} has no corporateAccountId`);
    corporateAccountId = undefined; // Set to undefined instead of empty string
  }

  const payload: JWTPayload = {
    userId: (user._id as mongoose.Types.ObjectId).toString(),
    email: user.email,
    role: user.role,
    corporateAccountId: corporateAccountId,
    firstName: user.firstName,
    lastName: user.lastName
  };

  const secret = new TextEncoder().encode(JWT_SECRET);
  
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(secret);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    
    // Convert the jose payload to our JWTPayload format
    const decodedPayload = payload as any;
    return {
      userId: decodedPayload.userId,
      email: decodedPayload.email,
      role: decodedPayload.role,
      corporateAccountId: decodedPayload.corporateAccountId,
      firstName: decodedPayload.firstName,
      lastName: decodedPayload.lastName
    };
  } catch (error) {
    return null;
  }
}

export function getTokenFromHeader(authHeader: string): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}
