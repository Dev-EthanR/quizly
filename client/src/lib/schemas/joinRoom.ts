import { z } from "zod";

export const joinRoomSchema = z.object({
  name: z
    .string()
    .trim()
    .max(20, "Username must be 20 characters or less"),
  roomCode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9]{6}$/, "Invalid room code."),
});

export type JoinRoomFormValues = z.infer<typeof joinRoomSchema>;
