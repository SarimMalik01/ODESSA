import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  addComment,
  getCommentsByProject,
  getUnreadComments
} from "../controllers/comment.controller.js";

const router = express.Router();

router.get(
  "/projects/:projectId/comments",
  requireAuth,
  getCommentsByProject
);

router.post(
  "/projects/:projectId/comments",
  requireAuth,
  addComment
);

router.get(
    "/projects/unread-comments",
    requireAuth,
    getUnreadComments
);
export default router;
