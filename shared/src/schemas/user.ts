import { z } from "zod";
import { emailSchema } from "./auth.js";

export const AVATAR_COLOR_IDS = [
  "violet",
  "green",
  "amber",
  "red",
  "blue",
  "pink",
  "cyan",
  "orange",
] as const;

export const avatarColorSchema = z.enum(AVATAR_COLOR_IDS);

export type AvatarColor = z.infer<typeof avatarColorSchema>;

export const displayNameSchema = z
  .string()
  .trim()
  .min(1, "Display name is required")
  .max(20, "Display name must be 20 characters or less");

export const updateProfileSchema = z.object({
  name: displayNameSchema,
  email: emailSchema,
  avatarColor: avatarColorSchema,
  image: z
    .string()
    .trim()
    .max(5_000_000, "Image is too large")
    .nullable()
    .optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
