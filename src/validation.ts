import { z } from "zod";
import { BadRequestError } from "./errors/http.js";

export const createChirpSchema = z.object({
  body: z.string().min(1, "Chirp body is required").max(140, "Chirp is too long. Max length is 140"),
});

export const createUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const loginUserSchema = createUserSchema;
export const updateUserSchema = createUserSchema;

export function parseBody<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new BadRequestError(result.error.issues[0].message);
  }
  return result.data;
}
