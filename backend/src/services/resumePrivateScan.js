import crypto from "crypto";
import Project from "../models/summary.db.js";
import { scanQueue } from "../queues/scanQueue.js";
import { getUniqueProjectName } from "../utils/getUniqueProjectName.js";

export async function resumePrivateScan({
  userId,
  repoUrl,
  projectName,
  tokenReference
}) {
  const name = await getUniqueProjectName(userId, projectName);
  const scanId = crypto.randomUUID();

  await Project.create({
    userId,
    name,
    scanId,
    status: "ENQUEUEING"
  });

  await scanQueue.add("scan-project", {
    scanId,
    repoUrl,
    tokenReference
  });

  return scanId;
}
