import { Router } from "express";
import { asyncHandler, requireAuth } from "../middleware.js";
import * as quizzesController from "../controllers/quizzes.controller.js";

const router = Router();

router.get(
  "/quizzes",
  requireAuth,
  asyncHandler(quizzesController.listMyQuizzes),
);

export default router;
