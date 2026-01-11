import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import projectRoutes from "./routes/project.routes.js";
import commentRoutes from "./routes/comment.routes.js"
import profileRoutes from "./routes/profile.routes.js"

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173", // your React app
    credentials: true,               // VERY IMPORTANT
  })
);

app.use(express.json());
app.use(cookieParser());
// 🔒 Disable browser caching for APIs
app.use((req, res, next) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("Surrogate-Control", "no-store");
    next();
  });

app.use("/api", commentRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);

app.get("/", (req, res) => {
  res.send("ODESSA Backend Running");
});

export default app;
