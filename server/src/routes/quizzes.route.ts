import { Router } from "express";
import {
  generateAnswersSchema,
  generateQuizSchema,
  publishQuizSchema,
  saveQuizDraftSchema,
} from "shared";
import { asyncHandler, validateBody } from "../middleware.js";
import { requireAuth } from "../middleware/requireAuth.js";
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

router.post(
  "/quizzes/generate",
  requireAuth,
  validateBody(generateQuizSchema),
  asyncHandler(quizzesController.generateQuiz),
);

router.post(
  "/quizzes/generate-answers",
  requireAuth,
  validateBody(generateAnswersSchema),
  asyncHandler(quizzesController.generateAnswers),
);

router.get(
  "/quizzes/saved",
  requireAuth,
  asyncHandler(quizzesController.listSavedQuizzes),
);

router.get(
  "/quizzes/:id",
  requireAuth,
  asyncHandler(quizzesController.getQuiz),
);

router.patch(
  "/quizzes/:id",
  requireAuth,
  validateBody(saveQuizDraftSchema),
  asyncHandler(quizzesController.updateQuizDraft),
);

router.post(
  "/quizzes/:id/publish",
  requireAuth,
  validateBody(publishQuizSchema),
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
