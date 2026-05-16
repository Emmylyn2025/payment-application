import { getUserService, updateUserService, deleteUserService } from "../services/user.service";
import { asyncHandler } from "../utils/error";
import { Request, Response, NextFunction } from "express";
import { createApiResponse } from "../utils/apiResponse";
import { UpdateUserInput } from "../types/types";
import { removeField } from "../utils/password";
import { prisma } from "../lib/prisma";
import { buildWhere, buildPagination, buildOrderBy, buildSelect } from "../utils/QueryBuilder";
import { getCache, hashReq, setCache } from "../utils/redisUtility";

export const me = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.id as string;
  const query = req.query;

  const user = await getUserService<typeof query>(userId, query);

  res.status(200).json(createApiResponse(true, user, "User Data"));
});

export const users = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

  const allowedFields = ['id', 'name', 'email', 'role', 'createdAt', 'updatedAt'];

  const { sort, page, limit, fields, ...filters } = req.query;

  const stringFields = ["name", "email", "role"];

  const where = buildWhere(filters, allowedFields, stringFields);

  const select = buildSelect(fields, allowedFields);

  const orderBy = buildOrderBy(sort, allowedFields);

  const { skip, take } = buildPagination(page, limit);

  //Get data from cache
  const cachedData = await getCache(`users:${hashReq(req.query)}`);

  if (cachedData) {
    return res.status(200).json(createApiResponse(true, JSON.parse(cachedData), "Users retrieved from cache"));
  }

  const users = await prisma.user.findMany({
    where,
    select,
    orderBy,
    skip,
    take
  });

  //If length is 0
  if (users.length === 0) {
    return res.status(204).json(createApiResponse(true, [], "Users record is empty"));
  }

  //Set data in cache for 10 minutes
  await setCache(`users:${hashReq(req.query)}`, JSON.stringify(users), 600);

  res.status(200).json(createApiResponse(true, users, "Users retrieved database"));
});

export const update = asyncHandler(async (req: Request<{ id: string }, {}, {}, UpdateUserInput>, res: Response, next: NextFunction) => {
  const userId = req.params.id
  const requesterId = req.user?.id as string;
  const updatedUser = await updateUserService(userId, req.body, requesterId);

  if (!updatedUser) return null;

  const withoutPassword = removeField(updatedUser, "password");

  res.status(200).json(createApiResponse(true, withoutPassword, "Data updated"));
});

export const deleteUser = asyncHandler(async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  const userId = req.params.id;
  const requesterId = req.user?.id as string;

  const user = await deleteUserService(userId, requesterId);

  if (!user) return null
  
  const withoutPassword = removeField(user, "password");

  res.status(200).json(createApiResponse(true, withoutPassword, "User deleted"));
});