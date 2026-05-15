import { getUserService, updateUserService, deleteUserService } from "../services/user.service";
import { asyncHandler } from "../utils/error";
import { Request, Response, NextFunction } from "express";
import { createApiResponse } from "../utils/apiResponse";
import { UpdateUserInput } from "../types/types";
import { removeField } from "../utils/password";
import { prisma } from "../lib/prisma";

export const me = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.id as string;
  const query = req.query;

  const user = await getUserService<typeof query>(userId, query);

  res.status(200).json(createApiResponse(true, user, "User Data"));
})

export const users = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

  const allowedFields = ['id', 'name', 'email', 'role', 'createdAt', 'updatedAt'];

  const { sort, page, limit, fields, ...filters } = req.query;

  //Filters side
  const filterKeys = Object.keys(filters);

  let where: Record<string, unknown> = {};

  const stringFields = ["name", "email", "role"];
  
  const safeFields = filterKeys.filter((key) => allowedFields.includes(key));

  for (const key of safeFields) {
    if (stringFields.includes(key) && typeof filters[key] === 'string') {
      where[key] = {contains: filters[key], mode: 'insensitive'}
    } else {
      where[key] = filters[key];
    }
  }

  //Select side
  const defaultSelect: Record<string, boolean> = Object.fromEntries(allowedFields.map((key) => [key, true])); 

  let select: Record<string, boolean> | undefined = defaultSelect;

  if (fields) {
    const selectedFields = typeof fields === 'string' ? fields.split(',') : [];

    const safeFields = selectedFields
      .filter((key) => key !== 'password' && allowedFields.includes(key))
      .map((key) => [key, true]);

    if (safeFields.length > 0) {
      select = Object.fromEntries(safeFields);
    }
  }
  
  // Sort side
  let orderBy = undefined;

  if (sort) {
    const selectedSorts = typeof sort === 'string' ? sort.split(',') : [];

    const safeSorts = selectedSorts.filter((elem) =>
      allowedFields.includes(elem.startsWith('-') ? elem.substring(1) : elem)
    );

    if (safeSorts.length > 0) {
      orderBy = safeSorts.map((elem) => {
        if (elem.startsWith('-')) {
          return { [elem.substring(1)]: 'desc' };
        }
        return { [elem]: 'asc' };
      });
    }
  }

  //Page and limit
  let currentPage = Number(page) || 2;
  let take = Number(limit) || 1

  const skip = (currentPage - 1) * take;

const users = await prisma.user.findMany({
  where,
  select,
  orderBy,
  skip,
  take
});

  res.status(200).json(createApiResponse(true, users, "Users retrieved"));
})

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
})