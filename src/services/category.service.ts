import { findCategorybyName, createNewCategory, findCategoryById, updateCategory, deleteCategory } from "../serviceFunctions/categoryFunctions"
import { appError } from "../utils/error";
import { Prisma } from "@prisma/client";
import { selectSome } from "../serviceFunctions/findUsers";

export async function createCategoryService(body: {name: string}, planId: string) {
  
  const category = await findCategorybyName(body.name);

  if (category) throw new appError("This category already exists", 422);

  const data: { name: string, planId: string } = { planId, name: body.name };

  //If category does not exists create new one
  const newCategory = await createNewCategory(data);

  return newCategory;
}


export async function getCategoryByIdService<T extends Record<string, unknown>>(id: string, reqQuery?: T) {
  const selectObject = selectSome<Prisma.CategorySelect>(reqQuery!, new Set([
    "id", "name", "createdAt", "updatedAt", "videos", "planId", "plan" 
  ]));

  const hasSelect = selectObject && Object.keys(selectObject).length > 0;

  const category = await findCategoryById(id, {
    select: hasSelect ? selectObject : undefined
  });

  if (!category) throw new appError("Category not found", 404);

  return category;
}

export async function updateCategoryService<T extends { name: string }>(id: string, reqBody: T) {
  
  const allwedUpdate = new Set<keyof T>(["name"]);

  if (!reqBody) return null;

  const check = Object.keys(reqBody).some((key) => !allwedUpdate.has(key as keyof T));

  if (check) throw new appError("You can only update the category name", 400);

  //Check if the category exists
  const category = await findCategoryById(id);

  if (!category) throw new appError("Category is not found", 404);

  //Update the category
  const updated = await updateCategory(id, reqBody);

  return updated;
}

export async function deleteCategoryService(id: string) {

  //Check if the category exists before deleting
  const category = await findCategoryById(id);

  if (!category) throw new appError("Category not found", 404);

  const deleted = await deleteCategory(id);

  return deleted;
}