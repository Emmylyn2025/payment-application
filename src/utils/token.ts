import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { TokensPayload } from '../types/types';
import { Response } from "express"


export function generateTokens<T extends TokensPayload>(payload: T): { accessToken: string; refreshToken: string } {
  const accessToken = jwt.sign(
    {
      id: payload.id,
      name: payload.name,
      role: payload.role,
      sessionId: payload.sessionId
    },
    process.env.JWT_ACCESS_TOKEN_SECRET as string,
    { expiresIn: '15m' });
  
  
  const refreshToken = jwt.sign(
    {
      id: payload.id,
      name: payload.name,
      role: payload.role,
      sessionId: payload.sessionId
    },
    process.env.JWT_REFRESH_TOKEN_SECRET as string,
    { expiresIn: '7d' });

  return { accessToken, refreshToken };
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function verifyAccessToken(token: string) : TokensPayload | null {
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET as string);
    return decoded as TokensPayload;
  } catch (err) {
    return null;
  }
}

export function verifyRefreshToken(token: string) : TokensPayload | null {
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_TOKEN_SECRET as string);
    return decoded as TokensPayload;
  } catch (err) {
    return null;
  } 
}

// export function invalidateTokens(sessionId: string) {
  
// }

export function saveRefreshTokenInCookie(res: Response, refreshToken: string) {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: false, //Set to true in production
    sameSite: 'none', //Set to 'lax' or 'strict' in production
    maxAge: 7 * 24 * 60 * 60 * 1000 //7 days
  });
}

export function saveAccessTokenInCookie(res: Response, accessToken: string) {
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: false, //Set to true in production
    sameSite: 'none', //Set to 'lax' or 'strict' in production
    maxAge: 15 * 60 * 1000 //15 minutes
  });
}

export function removeAccessFromCookie(res: Response) {
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: false, //Set to true in production
    sameSite: 'none', //Set to 'lax' or 'strict' in production
    maxAge: 15 * 60 * 1000
  })
}

export function removeRefreshFromCookie(res: Response) {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: false, //Set to true in production
    sameSite: 'none', //Set to 'lax' or 'strict' in production
    maxAge: 7 * 24 * 60 * 60 * 1000
  })
}

export const generateRandomToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};