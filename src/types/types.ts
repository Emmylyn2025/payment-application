
import { Role } from "@prisma/client";

export type UserReturnType = {
  id: string;
  email: string;
  name: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  role: Role;
}

export type AllUsersReturnType = Omit<UserReturnType, 'password'>;

export type apiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
}

export type TokensPayload = Pick<UserReturnType, "id" | "name" | "role"> & { sessionId: string };

//For req.user
declare global {
  namespace Express {
    interface Request {
      user?: TokensPayload | null;
    }
  }
}

export type UpdateUserInput = Partial<Pick<UserReturnType, "name" | "password" | "role">>