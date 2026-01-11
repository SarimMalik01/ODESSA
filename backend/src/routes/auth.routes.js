import express from "express";
import { signup, login } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

router.get("/me", requireAuth, (req, res) => {
  res.json({
    message: "Authenticated",
    userId: req.userId,
  });
});

export default router;
