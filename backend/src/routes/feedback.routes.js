import express from "express";
import { sendFeedback } from "../controllers/feedback.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js"

const router = express.Router();

router.post("/", requireAuth, sendFeedback);

export default router;
