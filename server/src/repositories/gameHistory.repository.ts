import { DASHBOARD_LIST_PAGE_SIZE } from "shared";
import { prisma } from "../lib/prisma.js";
import { Prisma } from "../generated/prisma/client.js";
import type {
  HostedSessionSummary,
  PlayedHistoryRow,
  RecordGameSessionParams,
} from "../entities/gameHistory.js";

export const gameHistoryRepository = {
  findAllPlayedByUser(userId: string): Promise<PlayedHistoryRow[]> {
    return prisma.gamePlayed.findMany({
      where: { userId },
      orderBy: { playedAt: "asc" },
      select: {
        score: true,
        rank: true,
        totalPlayers: true,
        correctCount: true,
        questionCount: true,
        avgAnswerMs: true,
        won: true,
        playedAt: true,
      },
    });
  },

  findHostedSessionsSummary(userId: string): Promise<HostedSessionSummary[]> {
    return prisma.gameSession.findMany({
      where: { hostUserId: userId },
      select: { playerCount: true },
    });
  },

  async findRecentGames(userId: string, page: number) {
    const [games, totalCount] = await Promise.all([
      prisma.gamePlayed.findMany({
        where: { userId },
        orderBy: { playedAt: "desc" },
        skip: (page - 1) * DASHBOARD_LIST_PAGE_SIZE,
        take: DASHBOARD_LIST_PAGE_SIZE,
        include: {
          session: {
            include: {
              quiz: { select: { title: true, coverImage: true } },
            },
          },
        },
      }),
      prisma.gamePlayed.count({ where: { userId } }),
    ]);

    return { games, totalCount };
  },

  async findHostedSessions(userId: string, page: number) {
    const [sessions, totalCount] = await Promise.all([
      prisma.gameSession.findMany({
        where: { hostUserId: userId },
        orderBy: { playedAt: "desc" },
        skip: (page - 1) * DASHBOARD_LIST_PAGE_SIZE,
        take: DASHBOARD_LIST_PAGE_SIZE,
        include: {
          quiz: { select: { title: true, coverImage: true } },
        },
      }),
      prisma.gameSession.count({ where: { hostUserId: userId } }),
    ]);

    return { sessions, totalCount };
  },

  findHostedSessionById(id: string, hostUserId: string) {
    return prisma.gameSession.findFirst({
      where: { id, hostUserId },
      include: {
        quiz: { select: { title: true, coverImage: true } },
        participants: { orderBy: { rank: "asc" } },
      },
    });
  },

  recordGameSession({
    quizId,
    hostUserId,
    playerCount,
    questionCount,
    completionRate,
    questionBreakdown,
    participants,
  }: RecordGameSessionParams) {
    return prisma.gameSession.create({
      data: {
        quizId,
        hostUserId: hostUserId ?? null,
        playerCount,
        questionCount,
        completionRate,
        questionBreakdown: questionBreakdown as unknown as Prisma.InputJsonValue,
        participants: {
          create: participants.map((participant) => ({
            userId: participant.userId,
            name: participant.name,
            color: participant.color ?? null,
            score: participant.score,
            rank: participant.rank,
            totalPlayers: participant.totalPlayers,
            correctCount: participant.correctCount,
            questionCount,
            avgAnswerMs: participant.avgAnswerMs,
            won: participant.won,
          })),
        },
      },
    });
  },
};
