import bcrypt from 'bcrypt';
import { UserReturnType } from '../types/types';

export async function hashPassword(password: string): Promise<string> { 
  return await bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> { 
  return await bcrypt.compare(password, hashedPassword);
}

export function removePassword<T extends {password: string}>(user: T): Omit<T, "password"> {
  const { password, ...rest } = user;
  return rest;
}

export function removeField<T, K extends keyof T>(obj: T, field: K): Omit<T, K> {
  const { [field]: _, ...rest } = obj;
  return rest;
}