import { Router } from "express";
import { asyncHandler, requireAuth } from "../middleware.js";
import { quizzesController } from "../controllers/quizzes.controller.js";

const router = Router();

router.get("/quizzes/categories", quizzesController.listCategories);

router.get("/quizzes/discover", asyncHandler(quizzesController.discoverQuizzes));

router.get(
  "/quizzes/discover/:id",
  asyncHandler(quizzesController.getDiscoverQuizById),
);

router.get(
  "/quizzes",
  requireAuth,
  asyncHandler(quizzesController.listMyQuizzes),
);

router.post(
  "/quizzes",
  requireAuth,
  asyncHandler(quizzesController.createQuiz),
);

router.get(
  "/quizzes/:id",
  requireAuth,
  asyncHandler(quizzesController.getQuiz),
);

router.patch(
  "/quizzes/:id",
  requireAuth,
  asyncHandler(quizzesController.updateQuizDraft),
);

router.post(
  "/quizzes/:id/publish",
  requireAuth,
  asyncHandler(quizzesController.publishQuiz),
);

router.post(
  "/quizzes/:id/save",
  requireAuth,
  asyncHandler(quizzesController.saveQuiz),
);

router.delete(
  "/quizzes/:id/save",
  requireAuth,
  asyncHandler(quizzesController.unsaveQuiz),
);

export default router;
