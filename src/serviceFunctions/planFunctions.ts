import { PrismaClient } from "@prisma/client/extension";
import { Prisma } from "@prisma/client";
import {prisma} from "../lib/prisma"
import { updatePlanType } from "../types/types";
import { appError } from "../utils/error";

const planSelect = {
  id: true,
  name: true,
  price: true,
  createdAt: true,
  updatedAt: true
} satisfies Prisma.PlanSelect

type DefaultSelect = Prisma.PlanGetPayload<{select: typeof planSelect}>

export async function findPlans(name: string) : Promise<DefaultSelect | null> {
  return await prisma.plan.findUnique({
    where: {name}
  })
}

export async function getPlanById<
  T extends Prisma.PlanSelect,
  I extends Prisma.PlanInclude
>(
  id: string,
  options?: { select?: T; include?: I }
): Promise<
  | DefaultSelect
  | Prisma.PlanGetPayload<{ select: T }>
  | Prisma.PlanGetPayload<{ include: I }>
  | null
> {
  const { select, include } = options ?? {};

  // select takes priority over include (can't use both)
  if (select && Object.keys(select).length > 0) {
    return await prisma.plan.findUnique({
      where: { id },
      select,
    });
  }

  if (include && Object.keys(include).length > 0) {
    return await prisma.plan.findUnique({
      where: { id },
      include,
    });
  }

  // Default: return planSelect fields only
  return await prisma.plan.findUnique({
    where: { id },
    select: planSelect,
  });
}

export async function createPlans(data: {name: string, price: number}) {
  return await prisma.plan.create({
    data
  });
}

export async function updatePlans<T extends updatePlanType>(id: string, data: T) {
  return await prisma.plan.update({
    where: { id },
    data
  })
}

export async function deletePlan(id: string) {
  return await prisma.plan.delete({
    where: {id}
  })
};