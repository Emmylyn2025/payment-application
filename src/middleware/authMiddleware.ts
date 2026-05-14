import { Request, Response, NextFunction } from "express";
import { appError } from "../utils/error";
import { verifyAccessToken } from "../utils/token";
import { getCache, deleteCache } from "../utils/redisUtility";
import { prisma } from "../lib/prisma"
import { deleteSession } from "../serviceFunctions/findUsers";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      return next(new appError("Unauthorized: No token provided", 401));
    }

    const decoded = verifyAccessToken(token);

    if (!decoded) {
      return next(new appError("Unauthenticated", 400))
    }


    //Check if session exists in cache
    const session = await getCache(`session:${decoded!.sessionId}`);

    if (session) {
      const objSession = JSON.parse(session as string);

      if (new Date(objSession?.expiredAt) <= new Date()) {
        //Delete session from redis and database
        await deleteSession(decoded!.sessionId);
        await deleteCache(`session:${decoded!.sessionId}`)


        return next(new appError("Session is expired", 401));
      }

      req.user = decoded;
      return next();
    }


    //If session does not exist in cache, check in database
    if (!session) {
      const dbSession = await prisma.session.findUnique({
        where: {
          id: decoded!.sessionId
        }
      });

      if (!dbSession) {
        return next(new appError("Unauthorized: Invalid token", 401));
      }

      if (new Date(dbSession.expiredAt) <= new Date()) {
        //Delete session from database
        await deleteSession(dbSession!.id);
        return next(new appError("Session is expired", 401));
      }
    }

    //If session exists, attach user info to request object and proceed
    req.user = decoded
    next();
  } catch (error) {
    console.log(error);
    return next(new appError("Unauthorized: Invalid token", 401));
  }
}
