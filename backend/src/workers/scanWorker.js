import { Worker } from "bullmq";
import { spawn } from "child_process";
import OAuthToken from "../models/oauthToken.db.js";
import { decrypt } from "../utils/crypto.js";
import Project from "../models/summary.db.js";

const REDIS_CONNECTION = {
  host: process.env.REDIS_HOST || "redis",
  port: 6379,
  maxRetriesPerRequest: null
};

export const scanWorker = new Worker(
  "scanQueue",
  async (job) => {
    const { scanId, repoUrl, tokenReference,userId } = job.data;

    let gitToken = null;

    if (tokenReference) {
      const tokenDoc = await OAuthToken.findById(tokenReference);
      gitToken = decrypt(tokenDoc.encryptedToken);
    }

    const dockerArgs = [
      "run",
      "--rm",
      "--network", "backend_default",
      "-e", `SCAN_ID=${scanId}`,
      "-e", `REPO_URL=${repoUrl}`,
      "-e", `MONGO_URI=${process.env.MONGO_URI}`,
      "-e", `GEMINI_API_KEY=${process.env.GEMINI_API_KEY}`,
      "-e", `REDIS_HOST=${process.env.REDIS_HOST || "redis"}`,
      "-e", `REDIS_PORT=6379`,
      "-e", `USER_ID=${userId}`
    ];

    if (gitToken) {
      dockerArgs.push("-e", `GIT_TOKEN=${gitToken}`);
    }

    dockerArgs.push("odessa-scan-engine:latest");

    return new Promise((resolve, reject) => {
      const child = spawn("docker", dockerArgs, { stdio: "inherit" });

      child.on("exit", (code) => {
        code === 0 ? resolve(true) : reject(new Error("Scan failed"));
      });
    });
  },
  { connection: REDIS_CONNECTION }
);

scanWorker.on("failed", async (job) => {
  if (!job?.data?.scanId) return;
  await Project.updateOne(
    { scanId: job.data.scanId },
    { $set: { status: "FAILED" } }
  );
});
