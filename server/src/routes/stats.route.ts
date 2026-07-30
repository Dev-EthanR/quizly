import { Router } from "express";
import { asyncHandler, requireAuth } from "../middleware.js";
import { statsController } from "../controllers/stats.controller.js";

const router = Router();

router.get(
  "/users/me/stats",
  requireAuth,
  asyncHandler(statsController.getDashboardStats),
);

router.get(
  "/users/me/games",
  requireAuth,
  asyncHandler(statsController.listRecentGames),
);

router.get(
  "/users/me/hosted-sessions",
  requireAuth,
  asyncHandler(statsController.listHostedSessions),
);

router.get(
  "/users/me/hosted-sessions/:sessionId",
  requireAuth,
  asyncHandler(statsController.getHostedSessionDetail),
);

export default router;
