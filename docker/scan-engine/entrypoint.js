import { MongoClient } from "mongodb";
import { execSync } from "child_process";
import path from "path";
import fs from "fs";

import { runScan } from "./adapters/runScan.js";
import { enrichWithGemini } from "./llm/enrichWithGemini.js";
import { ensureArchitectureConfig } from "./utils/ensureArchitectureConfig.js";
import { createPathRewriter } from "./utils/rewritePath.js";

const {
  SCAN_ID,
  REPO_URL,
  MONGO_URI,
  GIT_TOKEN,
  USER_ID
} = process.env;

if (!SCAN_ID || !REPO_URL || !MONGO_URI) {
  console.error("❌ Missing required env vars");
  process.exit(1);
}

const WORK_ROOT = "/work";
const PROJECT_DIR = path.join(WORK_ROOT, SCAN_ID);

async function updateProject(db, payload) {
  await db.collection("projects").updateOne(
    { scanId: SCAN_ID },
    {
      $set: {
        ...payload,
        updatedAt: new Date()
      }
    }
  );
}

async function main() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    const db = client.db();

    fs.mkdirSync(WORK_ROOT, { recursive: true });

    /* =====================
       CLONING
       ===================== */
    await updateProject(db, { status: "CLONING" });

    let cloneUrl = REPO_URL;
    if (GIT_TOKEN) {
      cloneUrl = REPO_URL.replace(
        "https://",
        `https://${GIT_TOKEN}@`
      );
    }

    execSync(`git clone ${cloneUrl} ${PROJECT_DIR}`, {
      stdio: "inherit"
    });

    /* =====================
       CONFIGURING
       ===================== */
    await updateProject(db, { status: "CONFIGURING" });

    ensureArchitectureConfig(PROJECT_DIR);

    /* =====================
       SCANNING
       ===================== */
    await updateProject(db, { status: "SCANNING" });

    const scanResult = await runScan(PROJECT_DIR);

    const {
      rewriteFileTree,
      rewriteNormalizedIssues,
      workspacePath
    } = createPathRewriter(SCAN_ID);

    const rewrittenFileTree =
      rewriteFileTree(scanResult.fileTree);

    const rewrittenIssues =
      rewriteNormalizedIssues(scanResult.normalizedIssues);

    /* =====================
       ANALYZING
       ===================== */
    await updateProject(db, {
      workspacePath,
      fileTree: rewrittenFileTree,
      normalizedIssues: rewrittenIssues,
      status: "ANALYZING"
    });

    /* =====================
       GEMINI
       ===================== */
    const geminiResponse = await enrichWithGemini(
      rewrittenIssues
    );

    /* =====================
       COMPLETED
       ===================== */
       await updateProject(db, {
        gemini: {
          status: "COMPLETED",
          response: geminiResponse.response,
          usage: geminiResponse.usage
        },
        status: "COMPLETED"
      });
      

    console.log("✅ Scan completed successfully");
    
    console.log("📡 Calling backend /odessa/upsert...");

    const res = await fetch("http://backend:5000/odessa/upsert", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        issues: rewrittenIssues,
        gemini: geminiResponse.response,
        scanId: SCAN_ID,
        repoId: REPO_URL
      })
    });
    
    console.log("📡 Response status:", res.status);
    
    const text = await res.text();
    console.log("📡 Response body:", text);
    
    if (!res.ok) {
      console.error("❌ Upsert FAILED");
      throw new Error(`Upsert failed: ${res.status}`);
    }
    
    console.log("✅ Issues actually upserted to RAG");
    process.exit(0);

  } catch (err) {
    console.error("🔥 Scan failed:", err);

    try {
      const db = client.db();
      if(err.code==="GEMINI_COST_LIMIT" || err.code=="GEMINI_RATE_LIMIT"){
        await updateProject(db,{
            status:"BLOCKED",
            gemini:{
                status:"SKIPPED",
                errorMeta:err.meta
            }
        });

        process.exit(0);
      }else{
        await updateProject(db, {
            status: "FAILED",
            error: err.message
          });
      }
    } catch (dbErr) {
      console.error(" Failed to update DB after crash:", dbErr);
    }

    process.exit(1);
  } finally {
    await client.close();
  }
}

main();
