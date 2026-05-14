import { prisma } from "../lib/prisma";
import { UserReturnType, UpdateUserInput } from "../types/types";

export async function findUserByEmail(email: string) : Promise<UserReturnType | null> {

  const user = await prisma.user.findUnique({
    where: {
      email
    }
  });

  return user;
}

export async function findUserById(id: string) : Promise<UserReturnType | null> {

  const user = await prisma.user.findUnique({
    where: {
      id
    }
  });

  return user;
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

export async function updateUser(id: string, data: UpdateUserInput) {
  return await prisma.user.update({
    where: {
      id
    },
    data
  })
}