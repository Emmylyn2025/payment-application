import { Select } from "@prisma/client/runtime/client";
import { prisma } from "../lib/prisma";
import { UserReturnType, UpdateUserInput } from "../types/types";
import { Prisma } from "@prisma/client";
import { AllUsersReturnType } from "../types/types";

const defaultUserSelect = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
  role: true,
  updatedAt: true
} satisfies Prisma.UserSelect

type DefaultUser = Prisma.UserGetPayload<{select: typeof defaultUserSelect}>

export async function findUserByEmail<T extends Prisma.UserSelect>(email: string, select?: T): Promise<DefaultUser | Prisma.UserGetPayload<{ select: T }> | null> {
  
  const hasSelect = select && Object.keys(select).length > 0

  if (hasSelect) {
    return await prisma.user.findUnique({
      where: {
        email
      },
      select
    })
  }

  return prisma.user.findUnique({
    where: {
      email
    },
    select: defaultUserSelect
  }) 
  
}

export async function findUserByEmailWithPassword(email: string) {
  return await prisma.user.findUnique({
    where: {email}
  })
}

export async function findUserById<T extends Prisma.UserSelect, I extends Prisma.UserInclude>(id: string, options?: {select?: T, include?: I}): Promise<DefaultUser | Prisma.UserGetPayload<{ select: T }> | Prisma.UserGetPayload<{include: T}> | null> {

  const { select, include } = options ?? {};
  
  if (select && Object.keys(select).length > 0) {
    return await prisma.user.findUnique({
      where: { id },
      select
    });
  }

  if (include && Object.keys(include).length > 0) {
    return await prisma.user.findUnique({
      where: { id },
      include
    });
  }

  return await prisma.user.findUnique({
    where: { id },
    select: defaultUserSelect
  }) 
  
}

export function selectSome<T extends Record<string, unknown>>(
  query: T,
  validFields: Set<keyof T>
): Partial<{ [k in keyof T]: true }> {
  if (!query) return {};
  
  return Object.fromEntries(
    Object.keys(query)
      .filter((key) => validFields.has(key as keyof T) && query[key] !== "false" && query[key] !== false)
      .map((key) => [key, true])
  ) as Partial<{ [k in keyof T]: true }>;
}


export async function newSession(userId: string, ip: string, userAgent: string) {

  const session = await prisma.session.create({
    data: {
      userId,
      ipAddress: ip,
      userAgent,
      refreshToken: '' //This will be updated when the user logs in and a refresh token is generated
    }
  });

  return session;
}

export async function getSession(token: string) {
  
  return await prisma.session.findUnique({
    where: {
      refreshToken: token
    }
  });
}

export async function getSessionById(id: string) {
  
  return await prisma.session.findUnique({
    where: {
      id
    }
  });
}

export async function deleteSession(id: string) {
  
  await prisma.session.delete({
    where: {
      id
    }
  })
}

export async function updateSession(token: string, id: string, time: Date) {
  return await prisma.session.update({
    where: {
      id: id
    },
    data: {
      refreshToken: token,
      expiredAt: time
    }
  })
}

export async function updateUser(id: string, data: UpdateUserInput & {emailVerified?: boolean}) {
  return await prisma.user.update({
    where: {
      id
    },
    data
  })
}

export async function deleteUser(id: string) {
  return await prisma.user.delete({
    where: { id }
  });
}


export async function getData<T extends Record<string, unknown>>(reqQuery?: T, ) {

}