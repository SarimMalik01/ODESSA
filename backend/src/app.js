import express from "express";
import cors from "cors";
import session from "express-session";


import cookieParser from "cookie-parser";

import feedbackRoutes from "./routes/feedback.routes.js"
import authRoutes from "./routes/auth.routes.js";
import projectRoutes from "./routes/project.routes.js";
import commentRoutes from "./routes/comment.routes.js"
import profileRoutes from "./routes/profile.routes.js"
import chatRoutes from "./routes/chat.routes.js";
import upsertRoutes from "./routes/upsert.routes.js";


import oauthRoutes from "./routes/oauth.routes.js"
const app = express();




app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      "http://localhost:5173",
      "http://127.0.0.1:5173"
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    name: "odessa.sid",
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,     // true only if HTTPS
      sameSite: "lax",
    },
  })
);

app.use("/api", commentRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/auth",oauthRoutes);
app.use("/odessa/chat", chatRoutes);
app.use("/odessa/upsert", upsertRoutes);
app.get("/", (req, res) => {
  res.send("ODESSA Backend Running");
});

export default app;
