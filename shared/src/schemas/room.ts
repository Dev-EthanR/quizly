import { z } from "zod";

export const ROOM_CODE_REGEX = /^[A-Z0-9]{6}$/;

const roomCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(ROOM_CODE_REGEX, "Invalid room code.");

const sessionTokenSchema = z.string().min(1, "Token is required");

export const hostGameSchema = z.object({
  quizId: z.string().min(1, "Quiz is required"),
  token: sessionTokenSchema,
});

export type HostGameInput = z.infer<typeof hostGameSchema>;

export const rejoinAsHostSchema = z.object({
  roomCode: roomCodeSchema,
  token: sessionTokenSchema,
});

export type RejoinAsHostInput = z.infer<typeof rejoinAsHostSchema>;

export const joinRoomSchema = z.object({
  name: z.string().trim().max(20, "Username must be 20 characters or less"),
  color: z.string().optional(),
  roomCode: roomCodeSchema,
  token: sessionTokenSchema,
});

export type JoinRoomInput = z.infer<typeof joinRoomSchema>;

export const rejoinRoomSchema = z.object({
  roomCode: roomCodeSchema,
  token: sessionTokenSchema,
});

export type RejoinRoomInput = z.infer<typeof rejoinRoomSchema>;

export const CHAT_MESSAGE_MAX_LENGTH = 300;

export const sendChatMessageSchema = z.object({
  roomCode: roomCodeSchema,
  message: z
    .string()
    .trim()
    .min(1, "Message is required")
    .max(
      CHAT_MESSAGE_MAX_LENGTH,
      `Message must be ${CHAT_MESSAGE_MAX_LENGTH} characters or less`,
    ),
});

export type SendChatMessageInput = z.infer<typeof sendChatMessageSchema>;

export const startGameSchema = z.object({
  roomCode: roomCodeSchema,
});

export type StartGameInput = z.infer<typeof startGameSchema>;

export const submitAnswerSchema = z.object({
  roomCode: roomCodeSchema,
  questionIndex: z.number().int().min(0),
  answerId: z.string().min(1),
});

export type SubmitAnswerInput = z.infer<typeof submitAnswerSchema>;

export const kickPlayerSchema = z.object({
  roomCode: roomCodeSchema,
  token: sessionTokenSchema,
});

export type KickPlayerInput = z.infer<typeof kickPlayerSchema>;
