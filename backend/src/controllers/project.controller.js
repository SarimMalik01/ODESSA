// import fs from "fs";
// import { unzipToWorkspace } from "../utils/unzip.js";
// import { runScan } from "../scanner/scanner.adapter.js";
// import { ensureArchitectureConfig } from "../utils/ensureArchitectureConfig.js";
// import { enrichWithGemini } from "../llm/enrichWithGemini.js";
import Project from "../models/summary.db.js";
import {getUniqueProjectName} from "../utils/getUniqueProjectName.js"
import SharedProject from "../models/sharedProject.model.js"

import crypto from "crypto";
import {scanQueue} from "../queues/scanQueue.js";
import {isRepoPublic} from "../utils/checkRepoAccessibility.js"

export const uploadProject = async (req, res) => {
  try {
   
    const { url, name: rawName } = req.body;

    if (!url || !rawName) {
      return res.status(400).json({
        message: "URL and project name required"
      });
    }
    const isPublic = await isRepoPublic(url);

    if (!isPublic) {
      return res.status(401).json({
        code: "OAUTH_REQUIRED",
        provider: "github",
        repoUrl: url,
        projectName: rawName,
        message:"This is a private repository. Please connect Github"
      });
    }


    const name = await getUniqueProjectName(req.userId, rawName);
    const scanId = crypto.randomUUID();

    const project = await Project.create({
      userId: req.userId,
      name,
      scanId,
      workspacePath: null,
      fileTree: null,
      normalizedIssues: null,
      gemini: { status: "PENDING" },
      status: "ENQUEUEING",
      seen:false
    });

    await scanQueue.add(
      "scan-project",
      {
        scanId,
        repoUrl: url,
        userId:req.userId
      },
      {
        attempts: 1,
        removeOnComplete: true,
        removeOnFail: false
      }
    );

    return res.status(202).json({
      message: "Project enqueued for scanning",
      projectId: project._id,
      scanId
    });

    // const { file } = req;
    // const { name: rawName } = req.body;
    // const name = await getUniqueProjectName(req.userId, rawName);

    

    // if (!file || !name) {
    //   return res.status(400).json({ message: "File and project name required" });
    // }

  
    // const project = await Project.create({
    //     userId: req.userId,
    //     name,
    //     workspacePath: null,
    //     fileTree: null,
    //     normalizedIssues: null,
    //     gemini: { status: "PENDING" },
    //     status: "UNZIPPING"
    //   });
   
    // const workspacePath = await unzipToWorkspace(file.path, name);
  
    // await Project.findByIdAndUpdate(project._id, {
    //     workspacePath,
    //     status: "CONFIGURING YOUR PROJECT"
    //   });
    // ensureArchitectureConfig(workspacePath);
    // await Project.findByIdAndUpdate(project._id, {
    //     status: "IGNITING ENGINE"
    //   });

      
    // fs.unlinkSync(file.path);
   
    // const scanResult = await runScan(workspacePath);

    //  await Project.findByIdAndUpdate(project._id, {
    //     fileTree: scanResult.fileTree,
    //     normalizedIssues: scanResult.normalizedIssues,
    //     status: "ANALYSING THROUGHPUT"
    //   });
    
   
    
    
  
    
    // if (scanResult.normalizedIssues.length > 0) {
    //   enrichWithGemini(scanResult.normalizedIssues)
    //     .then(async (geminiRes) => {
    //         console.log(" COMPLETED ");
    //       await Project.findByIdAndUpdate(project._id, {
    //         gemini: { status: "COMPLETED", response: geminiRes },
    //         status:"COMPLETED"
    //       });
    //     })
    //     .catch(async () => {
    //       await Project.findByIdAndUpdate(project._id, {
    //         gemini: { status: "FAILED" },
    //         status:"FAILED"
    //       });
    //     });
    // }
    
    // res.status(200).json({
    //   message: "Scan completed",
    //   projectId: project._id,
    //   result: scanResult
    // });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Scan failed" });
  }
};


export const getAllProjects = async (req, res) => {
    try {
      const userId = req.userId;
      console.log(userId)
      
      const projects = await Project.find({ userId })
        .select("_id name createdAt status gemini.errorMeta.reason")
        .sort({ createdAt: -1 });
        console.log(" propjects : ",projects)
      res.status(200).json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  };


export const getProjectById = async (req, res) => {
    
    try {
      const { projectId } = req.params;
      
      const currentUserId = req.userId;
      const ownerIdFromQuery = req.query.ownerId; 
      console.log(" currentUserId : ",currentUserId);

    const ownerIdToUse = ownerIdFromQuery || currentUserId;

    const project = await Project.findOne({
      _id: projectId,
      userId: ownerIdToUse,
    });
    console.log(" project user ID : ",project.userId);
    const shared = await SharedProject.findOne({
        projectId,
        status: "active",
        "recipients.userId": currentUserId,
      });
  
      if (shared) {
        const recipient = shared.recipients.find(
          (r) => r.userId.toString() === currentUserId.toString()
        );
  
        if (recipient) {
          recipient.accessedAt = new Date();
          await shared.save();
        }
      }
      if (
        project &&
        project.userId.toString() === currentUserId.toString() &&
        project.seen === false
      ) {

        project.seen = true;
        await project.save();
      }
    
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
  
      res.status(200).json(
        {...project,
        currentUserId});
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  };
  

  export const getLatestProjectStatus = async (req, res) => {
    try {
      const userId = req.userId;
  
      const project = await Project.findOne(
        { userId },
        { status: 1 }
      ).sort({ createdAt: -1 });
  
      if (!project) {
        return res.status(404).json({
          status: "NO_PROJECT"
        });
      }
  
      return res.status(200).json({
        projectId: project._id,
        status: project.status
      });
  
    } catch (err) {
      console.error("Fetch latest project status failed:", err);
      return res.status(500).json({
        status: "ERROR"
      });
    }
  };

  export const getActiveProject = async (req, res) => {
  try {
    const userId = req.userId;

    const project = await Project.findOne({
      userId,
      $or: [
        { status: { $nin: ["COMPLETED", "FAILED","BLOCKED"] } }, // still running
        { seen: false }                                // finished but unseen
      ]
    })
      .sort({ createdAt: -1 })
      .select("_id name status createdAt seen");

    if (!project) {
      return res.status(200).json({
        exists: false
      });
    }

    return res.status(200).json({
      exists: true,
      project: {
        projectId: project._id,
        name: project.name,
        status: project.status,
        seen: project.seen
      }
    });

  } catch (err) {
    console.error("getActiveProject error:", err);
    return res.status(500).json({
      message: "Failed to fetch active project"
    });
  }
};

export const markProjectAsSeen = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.userId; 

    console.log(" userID : ",userId);
    console.log(" project ID : ",projectId);
    const project = await Project.findOneAndUpdate(
      {
        _id: projectId,
        userId,          // 🔒 ensure ownership
      },
      {
        $set: { seen: true },
      },
      { new: true }
    );
    console.log(" project : ",project);
    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    return res.json({
      success: true,
      projectId: project._id,
    });
  } catch (err) {
    console.error("Mark as seen failed:", err);
    return res.status(500).json({
      message: "Failed to mark project as seen",
    });
  }
};