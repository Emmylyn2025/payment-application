import { randomInt } from "crypto";
import { getCache, deleteCache, setCache } from "../utils/redisUtility";
import { appError } from "../utils/error";

export function generate4DigitOtp(): string {
  const otp = randomInt(0, 10000);
  return otp.toString().padStart(4, "0");
}

export async function saveLoginOtpToRedis(userId: string, otp: string, ttlSeconds: number = 300) {
  const cacheKey = `loginotp:${userId}`;
  
  await setCache(cacheKey, otp, ttlSeconds); // Default: 5 minutes
}

export async function verifyLoginOtp(userId: string, otp: string) {

  const otpCacheKey = `loginotp:${userId}`;
  const failedAttemptsKey = `otpfailedattempts:${userId}`;
  const lockoutKey = `otplockout:${userId}`;

  const maxAttempts = 5;
  const lockoutDurationSeconds = 900; // 15 minutes
  const failedAttemptsTTL = 300; // 5 minutes

  // Check if user is locked out
  const isLockedOut = await getCache(lockoutKey);
  if (isLockedOut) {
    throw new appError("Too many failed attempts. Please try again later.", 429);
  }

  const expectedOtp = await getCache(otpCacheKey);

  if (!expectedOtp) {
    throw new appError("OTP expired or not found", 400);
  }

  if (expectedOtp !== otp) {
    // Increment failed attempts
    const failedAttempts = await getCache(failedAttemptsKey);
    const attempts = (failedAttempts ? parseInt(failedAttempts) : 0) + 1;

    if (attempts >= maxAttempts) {
      // Lock the user
      await setCache(lockoutKey, "true", lockoutDurationSeconds);
      await deleteCache(failedAttemptsKey);
      throw new appError("Too many failed attempts. Account locked for 15 minutes.", 429);
    }

    await setCache(failedAttemptsKey, attempts.toString(), failedAttemptsTTL);
    throw new appError(`Invalid OTP. Attempt ${attempts}/${maxAttempts}`, 401);
  }

  // Clear cache on successful verification
  await deleteCache(otpCacheKey);
  await deleteCache(failedAttemptsKey);

  return true;
}