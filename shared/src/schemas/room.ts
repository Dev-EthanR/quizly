import { z } from "zod";

export const hostGameSchema = z.object({
  quizId: z.string().min(1, "Quiz is required"),
});

export type HostGameInput = z.infer<typeof hostGameSchema>;

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

export type JoinRoomInput = z.infer<typeof joinRoomSchema>;
