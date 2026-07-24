import { z } from "zod";

export const ROOM_CODE_REGEX = /^[A-Z0-9]{6}$/;

export const joinRoomSchema = z.object({
  name: z.string().trim().max(20, "Username must be 20 characters or less"),
  color: z.string().optional(),
  roomCode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(ROOM_CODE_REGEX, "Invalid room code."),
});

export type JoinRoomFormValues = z.infer<typeof joinRoomSchema>;
