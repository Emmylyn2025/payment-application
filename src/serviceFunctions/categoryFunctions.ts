import { Category, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

export async function findCategorybyName(name: string) : Promise<Category | null>{
  return await prisma.category.findUnique({
    where: {name}
  })
}

export async function createNewCategory<T extends {name: string, planId: string}>(data: T) : Promise<Category> {
  return await prisma.category.create({
    data: {
      name: data.name,
      planId: data.planId
    }
  });
}

const defaultSelect = {
  id: true,
  name: true,
  planId: true,
  createdAt: true,
  updatedAt: true
} satisfies Prisma.CategorySelect

type DefaultSelect = Prisma.CategoryGetPayload<{select: typeof defaultSelect}>

export async function findCategoryById<T extends Prisma.CategorySelect, I extends Prisma.CategoryInclude>(id: string, option?: {select?: T, include?: I }) : Promise<DefaultSelect | Prisma.CategoryGetPayload<{select: T}> | Prisma.CategoryGetPayload<{include: I}> | null> {

  const { select, include } = option ?? {};

  if (select && Object.keys(select).length > 0) {
    return await prisma.category.findUnique({
      where: { id },
      select
    })
  }

   if (include && Object.keys(include).length > 0) {
    return await prisma.category.findUnique({
      where: { id },
      include
    })
  }

  return await prisma.category.findUnique({
    where: { id },
    select: defaultSelect
  });
}

export async function updateCategory<T extends {name: string}>(id: string, data: T) : Promise<Category> {
  return await prisma.category.update({
    where: { id },
    data
  });
}

export async function deleteCategory(id: string) : Promise<Category> {
  return await prisma.category.delete({
    where: {id}
  })
};