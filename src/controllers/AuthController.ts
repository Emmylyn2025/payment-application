import { appError, asyncHandler } from "../utils/error";
import { Request, Response, NextFunction } from "express";
import { registerUserService, loginUserService, forgotPasswordService, resetPasswordService } from "../services/auth.service";
import { createApiResponse } from "../utils/apiResponse";
import { saveRefreshTokenInCookie, saveAccessTokenInCookie, removeAccessFromCookie, removeRefreshFromCookie } from "../utils/token";
import { removeField } from "../utils/password";
import { hashToken } from "../utils/token";
import { deleteCache, getCache, setCache } from "../utils/redisUtility";
import { verifyRefreshToken, generateTokens } from "../utils/token";
import { deleteSession, getSession, updateSession } from "../serviceFunctions/findUsers";

export const registerUserController = asyncHandler(async (req: Request<{}, {}, { name: string; email: string; password: string }>, res: Response, next: NextFunction) => {

  const user = await registerUserService(req.body);
  res.status(201).json(createApiResponse(true, user, "User registered successfully"));
});

export const loginUserController = asyncHandler(async (req: Request<{}, {}, { email: string; password: string}>, res: Response, next: NextFunction) => { 
  const ip = req.ip!;
  const userAgent = req.headers['user-agent'] || 'Unknown';

  const user = await loginUserService({ ...req.body, ip, userAgent }, req);

  //Save tokens in cookies
  saveAccessTokenInCookie(res, user.accessToken);
  saveRefreshTokenInCookie(res, user.refreshToken);

  //Remove refreshToken from user object before sending response
  const userRefreshToken = removeField(user, "refreshToken");

  res.status(200).json(createApiResponse(true, userRefreshToken, "User logged in successfully"));
});

export const refreshController = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

  //Get refreshToken from cookie
  const refreshToken1 = req.cookies.refreshToken;

  if (!refreshToken1) {
    return next(new appError("No refresh token in cookie", 400));
  }

  const decoded = verifyRefreshToken(refreshToken1);

  if (!decoded) {
    return next(new appError("Unauthenticated", 401));
  }

  //If refresh token is in cookie hash the token and get the session from the database
  const hashedRefresh = hashToken(refreshToken1);

  //Get the user session from the cache first
  const session = await getCache(`session:${decoded?.sessionId}`);

  if (session) {
    //JSON.parse the obj session
    const objSession = JSON.parse(session as string);

    //Check if session hashed is token same as refresh hashed token
    if (objSession?.refreshToken !== hashedRefresh) {
      //Delete session from redis and database
      await deleteCache(`session:${objSession?.id}`)
      await deleteSession(objSession?.id);
      return next(new appError("Invalid session", 401));
    }

    //Check if session is expired 
    if (new Date(objSession.expiredAt) <= new Date()) {
      //Delete session from redis and cache
      await deleteCache(`session:${objSession?.id}`)
      await deleteSession(objSession?.id);
      return next(new appError("Expired session", 401));
    }

    //If they are equal refresh the tokens and update redis and database
    const { accessToken, refreshToken } = generateTokens(decoded!)

    //Hash new refresh token
    const hashed = hashToken(refreshToken);

    //Update database
    const newSession = await updateSession(hashed, objSession?.id, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
    //Save new session in redis
    await setCache(`session:${newSession.id}`, JSON.stringify(newSession), 7 * 24 * 60 * 60);
    
    saveAccessTokenInCookie(res, accessToken);
    saveRefreshTokenInCookie(res, refreshToken);

    return res.status(200).json(createApiResponse(true, null, "Access token refreshed from cache"));
  }

  //If session is not in redis, check the database
  const dbSession = await getSession(hashedRefresh);

  if (!dbSession) {
    return next(new appError("Session not found", 404));
  }

  //Check if session is expired 
  if (new Date(dbSession?.expiredAt) <= new Date()) {
    //Delete session from database
    await deleteSession(dbSession?.id);
    return next(new appError("Expired session", 401));
  }

  const { accessToken, refreshToken } = generateTokens(decoded!);

  //Hash new refresh token
  const hashed = hashToken(refreshToken);
  
  //Update database
  await updateSession(hashed, dbSession?.id, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));

  saveAccessTokenInCookie(res, accessToken);
  saveRefreshTokenInCookie(res, refreshToken);

  res.status(200).json(createApiResponse(true, null, "Access token refreshed from database"));
});

export const logoutController = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  //Get refreshToken from cookie
  const refreshToken1 = req.cookies.refreshToken;

  if (!refreshToken1) {
    return next(new appError("No refresh token in cookie", 400));
  }

  const decoded = verifyRefreshToken(refreshToken1);

  if (!decoded) {
    return next(new appError("Unauthenticated", 401));
  }

  //Get the session from the cache
  const cachedSession = await getCache(`session:${decoded.sessionId}`);

  if (cachedSession) {
    const session = JSON.parse(cachedSession as string);

    //Delete the session from redis and database and also remove from cookie
    await deleteSession(session.id);
    await deleteCache(`session:${decoded.sessionId}`);
    removeAccessFromCookie(res);
    removeRefreshFromCookie(res);

    return res.status(200).json(createApiResponse(true, null, "User logged out(cache)"));
  }

  //Fallback to database
  if (!cachedSession) {
    await deleteSession(decoded.sessionId);
    removeAccessFromCookie(res);
    removeRefreshFromCookie(res);

    return res.status(200).json(createApiResponse(true, null, "User logged out(Database)"));
  }
});

export const forgotPasswordController = asyncHandler(async (req: Request<{}, {}, { email: string }>, res: Response, next: NextFunction) => {
  const url = await forgotPasswordService(req.body);

  res.status(200).json(createApiResponse(true, url, "Reset password url"));
});

export const resetPasswordController = asyncHandler(async (req: Request<{}, {}, { newPassword: string }, { token: string }>, res: Response, next: NextFunction) => {

  const together = { ...req.body, ...req.query };

  resetPasswordService(together);

  res.status(200).json(createApiResponse(true, null, "Password reset successfull"));
});