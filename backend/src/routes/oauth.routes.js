import express from "express";
import {
  startGithubOAuth,
  githubCallback
} from "../controllers/oauth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
const router = express.Router();

router.get("/github", requireAuth,startGithubOAuth);
router.get("/github/callback",requireAuth, githubCallback);

export default router;
