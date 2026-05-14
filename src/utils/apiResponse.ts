
import { apiResponse } from "../types/types";

export const createApiResponse = <T>(success: boolean, data?: T, message?: string): apiResponse<T> => {
  return {
    success,
    data,
    message
  };
};