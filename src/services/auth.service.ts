import { hashPassword } from "../utils/password";
import { prisma } from "../lib/prisma";
import { UserReturnType } from "../types/types";
import { removePassword } from "../utils/password";
import { findUserByEmailWithPassword, getSession, newSession, updateUser, findUserById } from "../serviceFunctions/findUsers";
import { comparePassword } from "../utils/password";
import { generateTokens, verifyRefreshToken, generateRandomToken } from "../utils/token";
import { hashToken } from "../utils/token";
import { getCache, setCache, deleteCache } from "../utils/redisUtility";
import { Request, Response } from "express";
import { updateSession } from "../serviceFunctions/findUsers";
import { appError } from "../utils/error";

export async function registerUserService<T extends { name: string; email: string; password: string }>(body: T): Promise<Omit<UserReturnType, "password"> & {url: string}> { 

  const { name, email, password } = body;

  //Check if user already exists
  const existingUser = await findUserByEmailWithPassword(email);

  if (existingUser) {
    throw new appError("User already exists", 422);
  }

  //If user does not exist, hash the password and create the user
  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword
    }
  });

  //Return user by removing password field
  const userWithoutPassword = removePassword(user);

  //Generate the the email verification token
  const token = generateRandomToken();

  //Hash token before saving in redis for 24 hours
  await setCache(`emailverificationtoken:${hashToken(token)}`, user.id , 60 * 60 * 24);

  //Generate url 
  const url = `http://localhost:3000/v1/subscription/verify-email/${token}`;

  return { ...userWithoutPassword, url };
}

export async function verifyEmailService(token: string) {
  
  //Hash token to check if it still exists in redis
  const hashedToken = hashToken(token);

  const userId = await getCache(`emailverificationtoken:${hashedToken}`);

  if (!userId) throw new appError("Invalid or expired token", 400);

  //Check if the user exists
  const user = await findUserById(userId);

  if (!user) throw new appError("This user is not found", 404);

  //Update the user data
  const updated = await updateUser(userId, {
    emailVerified: true
  });

  //Delete from redis
  await deleteCache(`emailverificationtoken:${hashedToken}`);

  return updated;
}

export async function loginUserService<T extends { email: string; password: string, ip: string, userAgent: string }>(body: T, req?: Request) {
  const { email, password, ip, userAgent } = body;

  const user = await findUserByEmailWithPassword(email);

  if (!user) {
    throw new appError("Invalid credentials", 401);
  }

  const isMatch = await comparePassword(password, user.password);

  if (!isMatch) {
    throw new appError("Invalid credentials", 401);
  }

  //Before creating a new session check if the user is currently logged in
  const refreshTokenSaved = req?.cookies.refreshToken;

  if (refreshTokenSaved) {
    const hashed = hashToken(refreshTokenSaved);

    const session = await getSession(hashed);

    if (session) {
      throw new appError("This is a logged in user", 400);
    }
  }

  //Create a new session for the logged in user
  const session = await newSession(user.id, ip, userAgent);

  //Generate access and refresh tokens
  const { accessToken, refreshToken } = generateTokens({
    id: user.id,
    name: user.name,
    role: user.role,
    sessionId: session.id
  });

  //Hash the refresh token and update the session with the hashed refresh token
  const hashedRefreshToken = hashToken(refreshToken);

  //Set when the session was created and when it will expire (7 days from now)
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); //7 days from now

  const updatedSession = await updateSession(hashedRefreshToken, session.id, expiresAt);

  //Return user by removing password field
  const userWithoutPassword = removePassword(user);

  //Save the session in cache
  await setCache(`session:${session.id}`, JSON.stringify(updatedSession), 10 * 60); //Expire in 10 minutes

  return { ...userWithoutPassword, accessToken, refreshToken };
} 

export async function forgotPasswordService<T extends { email: string }>(body: T) {
  
  const { email } = body;

  const user = await findUserByEmailWithPassword(email);

  if (!user) throw new appError("User not found", 404);

  //If user exists generate reandom token
  const token = generateRandomToken();

  //Hash token before setting in redis
  const hashed = hashToken(token);

  //save in redis for ten minutes
  await setCache(`forgotpasswordtoken:${hashed}`, user.id, 600);

  //Generate url
  const url = `http://localhost:3000/v1/subscription/reset-password?token=${token}`;

  return url;
}

export async function resetPasswordService<T extends {token: string, newPassword: string}>(body: T) {

  const { token, newPassword } = body;

  //Hash token and get token from redis
  const hashed = hashToken(token);

  //Get token from redis
  const userId = await getCache(`forgotpasswordtoken:${hashed}`);

  if (!userId) throw new appError("Expired or invalid token", 400);

  //Find user and update the user
  await updateUser(userId!, { password: await hashPassword(newPassword) });
}
