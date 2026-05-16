import redis from "../redis/redisClient";
import crypto from "crypto"

export const setCache = async (key: string, value: string, ttl: number) => {
  try {
    await redis.set(key, value, "EX", ttl);
  } catch (error) {
    console.error("Error setting cache:", error);
  }
}

export const getCache = async (key: string): Promise<string | null> => {
  try {
    const value = await redis.get(key);
    return value;
  } catch (error) {
    console.error("Error getting cache:", error);
    return null;
  }
}
export const deleteCache = async (key: string) => {
  try {
    await redis.del(key);
  } catch (error) {
    console.error("Error deleting cache:", error);
  }
}

export const deletePattern = async (pattern: string) => {
  try {
    const keys = await redis.keys(pattern);

    if (keys.length > 0) {
      await redis.del(keys);
    }
    
  } catch (error) {
    console.log("Error occured deleting pattern", error);
  }
}

export const hashReq = (reqQuery: Record<string, unknown>) => {
  return crypto.createHash("md5").update(JSON.stringify(reqQuery)).digest("hex");
}