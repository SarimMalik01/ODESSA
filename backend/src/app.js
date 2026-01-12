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
    origin: "http://localhost:5173", 
    credentials: true,            
  })
);

app.use(express.json());
app.use(cookieParser());


app.use("/api", commentRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);

app.get("/", (req, res) => {
  res.send("ODESSA Backend Running");
});

export default app;
