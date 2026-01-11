import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { getUserProfileAnalytics } from "../controllers/profile.controller.js";

const router = express.Router();

router.get("/analytics", requireAuth, getUserProfileAnalytics);

export default router;
