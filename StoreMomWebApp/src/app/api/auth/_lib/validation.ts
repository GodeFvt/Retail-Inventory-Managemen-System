import { z } from "zod";

export const setupSchema = z.object({
  email: z.string().email().max(191).transform((value) => value.toLowerCase().trim()),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email: z.string().email().max(191).transform((value) => value.toLowerCase().trim()),
  password: z.string().min(1).max(128),
});
