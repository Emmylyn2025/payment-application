import { createCategoryService, getCategoryByIdService, updateCategoryService, deleteCategoryService } from "../services/category.service";
import { createApiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/error";
import { Request, Response, NextFunction } from "express";
import { buildWhere, buildPagination, buildOrderBy, buildSelect } from "../utils/QueryBuilder";
import {prisma} from "../lib/prisma"
import { deleteCategory } from "../serviceFunctions/categoryFunctions";

export const createCategoryController = asyncHandler(async (req: Request<{ id: string }, {}, { name: string }>, res: Response, next: NextFunction) => {
  const planId = req.params.id;
  const name = req.body.name;

  const newCategory = await createCategoryService({ name }, planId);

  res.status(201).json(createApiResponse(true, newCategory, "Video Category created"));
});

export const getCategoryByIdController = asyncHandler(async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  
  const category = await getCategoryByIdService(req.params.id, req.query);

  res.status(200).json(createApiResponse(true, category, "Category retreived from database"));
});

export const getAllCategoryController = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const allowedFields = ['id', 'name', 'planId', 'plan', 'updatedAt', "createdAt", "videos"];
  
  const stringFields = ["name"];

  const { sort, page, limit, fields, ...filters } = req.query;

  const where = buildWhere(filters, allowedFields, stringFields);

  const select = buildSelect(filters, allowedFields);

  const orderBy = buildOrderBy(sort, allowedFields);

  const { skip, take } = buildPagination(page, limit);

  const category = await prisma.category.findMany({
    where,
    select,
    orderBy,
    skip,
    take
  });

  if (category.length === 0) return res.status(200).json(createApiResponse(true, [], "Category is empty"));

  res.status(200).json(createApiResponse(true, category, "Category data retreived from database"));
});

export const updateCategoryController = asyncHandler(async (req: Request<{ id: string }, {}, { name: string }>, res: Response, next: NextFunction) => {
  
  const updated = await updateCategoryService(req.params.id, req.body);

  res.status(200).json(createApiResponse(true, updated, "Category updated successfully"));
});

export const deleteCategoryController = asyncHandler(async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {

  const deleted = await deleteCategory(req.params.id);

  res.status(200).json(createApiResponse(true, deleted, "Category deleted"));
});