import { z } from "zod";

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters"),

  description: z
    .string()
    .optional(),

  priority: z.enum(["low", "medium", "high"]),

  status: z
    .enum(["todo", "in_progress", "done"])
    .default("todo"),
});