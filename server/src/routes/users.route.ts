import { Router } from "express";
import { asyncHandler, requireAuth } from "../middleware.js";
import * as usersController from "../controllers/users.controller.js";

const router = Router();

router.get("/users/me", requireAuth, asyncHandler(usersController.getMe));

router.patch(
  "/users/me",
  requireAuth,
  asyncHandler(usersController.updateMe),
);

export default router;
