import { findUserById, selectSome, updateUser, deleteUser } from "../serviceFunctions/findUsers";
import { appError } from "../utils/error";
import { Prisma } from "@prisma/client";
import { hashPassword } from "../utils/password";
import { UpdateUserInput } from "../types/types";
import { setCache, getCache, deletePattern, hashReq } from "../utils/redisUtility";

export async function getUserService<T>(userId: string, reqQuery?: T) {

  const queryObject = selectSome<Prisma.UserSelect>(reqQuery!, new Set(["id", "name", "email", "role", "createdAt", "updatedAt", "subscriptions", "sessions"]));

  const hasSelect = queryObject && Object.keys(queryObject).length > 0;

  //Hash the reqQuery object
  const hashedReqQuery = hashReq(reqQuery!);

  //Get user from redis before checking the database
  const cachedUser = await getCache(`userdata:${userId}:${hashedReqQuery}`);

  if (cachedUser) {
    return JSON.parse(cachedUser);
  }

  const user = await findUserById(userId, {
    select: hasSelect ? queryObject : undefined
  });

  if (!user) throw new appError("User not found", 404); 

  //Set the user data in redis for 10 minutes
  await setCache(`userdata:${userId}:${hashedReqQuery}`, JSON.stringify(user), 600);

  return user;
}

export async function updateUserService<T extends UpdateUserInput>(userId: string, reqBody?: T, requesterId?: string): Promise<UpdateUserInput | null> {

  const valid = new Set<keyof UpdateUserInput>(["name", "role", "password"]);

  if (!reqBody) return null;

  const isInvalid = Object.keys(reqBody).some((key) => !valid.has(key as keyof UpdateUserInput));

  if (isInvalid) throw new appError("You can only update name, password and role", 400);

  //Get the requester
  const requester = await findUserById(requesterId!);

  const isSelf = userId === requesterId;
  const isAdmin = requester?.role === "ADMIN";

  if (!isSelf && !isAdmin) throw new appError("You are not allowed to take this action", 403);

  if ("role" in reqBody && reqBody.role) {
    const user = await findUserById(requesterId!);

    if(user?.role !== 'ADMIN') throw new appError("You can't change your role, you are not an admin", 403) 
  }

  if ("password" in reqBody && reqBody.password) {
    const hashed = await hashPassword(reqBody.password)

    await deletePattern(`userdata:${userId}:*`);
    await deletePattern(`users:*`);

    return await updateUser(userId, { ...reqBody, password: hashed });
  }

  await deletePattern(`userdata:${userId}:*`);
  await deletePattern(`users:*`);

  return await updateUser(userId, reqBody)
}

export async function deleteUserService(userId: string, requesterId: string) {

  const requester = await findUserById(requesterId);

  //Check if requester exists
  if (!requester) throw new appError("Requester not found", 404);

  //Check if user is admin
  if (requester?.role !== "ADMIN") throw new appError("You can't take this action", 403);

  //Check if you want to delete your account
  if (userId === requesterId) throw new appError("You can't delete your account", 400);

  //Check if user exists
  const userToBeDeleted = await findUserById(userId);

  if (!userToBeDeleted) throw new appError("User not found", 404);

  //Delete the user
  const deleted = await deleteUser(userId);

  await deletePattern(`userdata:${userId}:*`);
  await deletePattern(`users:*`);

  return deleted;
}