import { asyncHandler } from "../utils/error";
import { Request, Response, NextFunction } from "express";
import { createPlanService, deletePlanService, getPlanByIdService, updatePlanService } from "../services/plans.service";
import { createApiResponse } from "../utils/apiResponse";
import { buildWhere, buildPagination, buildOrderBy, buildSelect } from "../utils/QueryBuilder";
import { prisma } from "../lib/prisma";
import { updatePlanType } from "../types/types";

export const createPlanController = asyncHandler(async (req: Request<{}, {}, { name: string, price: number }>, res: Response, next: NextFunction) => {
  const newPlan = await createPlanService(req.body);

  res.status(201).json(createApiResponse(true, newPlan, "Plan created Successfully"));
});

export const getSinglePlan = asyncHandler(async (req: Request<{id: string}>, res: Response, next: NextFunction) => {
  const id = req.params.id;
  const query = req.query;

  const plan = await getPlanByIdService(id, query);

  res.status(200).json(createApiResponse(true, plan, "Plan retrieved"));
})

export const getAllPlans = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const allowedFields = ['id', 'name', 'price', 'createdAt', 'updatedAt', 'interval', 'subscriptions', 'categories'];

  const stringFields = ["name", "interval"];

  const { sort, page, limit, fields, ...filters } = req.query;


  const where = buildWhere(filters, allowedFields, stringFields);

  const select = buildSelect(fields, allowedFields);

  const orderBy = buildOrderBy(sort, allowedFields);

  const { skip, take } = buildPagination(page, limit);

  const plans = await prisma.plan.findMany({
    where,
    select,
    orderBy,
    skip,
    take
  });

  //If length is 0
  if (plans.length === 0) {
    return res.status(200).json(createApiResponse(true, [], "Plans record is empty"));
  }

  res.status(200).json(createApiResponse(true, plans, "Plans retrieved database"));
});

export const updatePlan = asyncHandler(async (req: Request<{ id: string }, {}, updatePlanType>, res: Response, next: NextFunction) => {
  const planId = req.params.id;
  const updatedPlan = await updatePlanService(planId, req.query);

  res.status(200).json(createApiResponse(true, updatedPlan, "Plan updated"));
});

export const deletePlan = asyncHandler(async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  const planId = req.params.id;

  const deletedPlan = await deletePlanService(planId);

  res.status(200).json(createApiResponse(true, deletedPlan, "Plan deleted"));
});