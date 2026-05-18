import { appError } from "../utils/error";
import { findPlans, createPlans, getPlanById, updatePlans, deletePlan } from "../serviceFunctions/planFunctions";
import { selectSome } from "../serviceFunctions/findUsers";
import { Prisma } from "@prisma/client";
import { updatePlanType } from "../types/types";

export async function createPlanService<T extends {name: string, price: number}>(body: T) {
  //Check if plan exists before
  const plan = await findPlans(body.name);

  if (plan) throw new appError("The plan name exists", 400)
  
  //If plan name does not exists create a new plan
  const newPlan = await createPlans(body);

  return newPlan;
}

export async function getPlanByIdService<T extends Record<string, unknown>>(
  id: string,
  reqQuery?: T
) {
  const selectObject = selectSome<Prisma.PlanSelect>(reqQuery!, new Set([
    "id", "name", "price", "createdAt", "updatedAt",
    "categories", "subscriptions"
  ]));

  const hasSelect = selectObject && Object.keys(selectObject).length > 0;

  // Always use select — relations are valid inside select too
  const plan = await getPlanById(id, {
    select: hasSelect ? selectObject : undefined,
  });

  if (!plan) throw new appError("Plan not found", 404);

  return plan;
}

export async function updatePlanService<T extends updatePlanType>(id: string, reqBody: T) {

  const allowedUpdate = new Set<keyof updatePlanType>(["name", "interval", "price"]);
  const allowedUpdateInterval = new Set(["MONTHLY", "YEARLY"]);

  if (!reqBody) return null;

  const inValid = Object.keys(reqBody).some((key) => !allowedUpdate.has(key as keyof updatePlanType));

  if (reqBody.interval) {
    const toUpper = reqBody.interval.toUpperCase();

    if (!allowedUpdateInterval.has(toUpper)) throw new appError("Invalid plan interval, only MONTHLY or YEARLY are allowed", 400);

    reqBody.interval = toUpper as updatePlanType["interval"];
  }

  if (inValid) throw new appError("There is an invalid field you want to update", 400);

  const plan = await getPlanById(id);

  if (!plan) throw new appError("Plan not found", 404);

  //If the plan is found then update the plan
  const updated = await updatePlans(id, reqBody);

  return updated;
}

export async function deletePlanService(id: string) {

  //Check if the plan exists
  const plan = await getPlanById(id);

  if (!plan) throw new appError("Plan does not exist", 404);

  //delete the plan
  const deleted = await deletePlan(id);

  return deleted;
}