import { Router } from "express";
import { asyncHandler } from "../middleware.js";
import * as usersController from "../controllers/users.controller.js";

const router = Router();

router.post("/register", asyncHandler(usersController.register));

export default router;
