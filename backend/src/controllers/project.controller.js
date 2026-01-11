import fs from "fs";
import { unzipToWorkspace } from "../utils/unzip.js";
import { runScan } from "../scanner/scanner.adapter.js";
import { ensureArchitectureConfig } from "../utils/ensureArchitectureConfig.js";
import { enrichWithGemini } from "../llm/enrichWithGemini.js";
import Project from "../models/summary.db.js";
import {getUniqueProjectName} from "../utils/getUniqueProjectName.js"
import SharedProject from "../models/sharedProject.model.js"
export const uploadProject = async (req, res) => {
  try {
    console.log("➡️ Upload started");

    const { file } = req;
    const { name: rawName } = req.body;
    const name = await getUniqueProjectName(req.userId, rawName);

    console.log(" file uploaded : ",name);

    if (!file || !name) {
      return res.status(400).json({ message: "File and project name required" });
    }

    console.log(" unzipping : ");
    const project = await Project.create({
        userId: req.userId,
        name,
        workspacePath: null,
        fileTree: null,
        normalizedIssues: null,
        gemini: { status: "PENDING" },
        status: "UNZIPPING"
      });
    console.log(" saving : ");
    const workspacePath = await unzipToWorkspace(file.path, name);

    await Project.findByIdAndUpdate(project._id, {
        workspacePath,
        status: "CONFIGURING YOUR PROJECT"
      });

      
    
    ensureArchitectureConfig(workspacePath);
    await Project.findByIdAndUpdate(project._id, {
        status: "IGNITING ENGINE"
      });

      
    fs.unlinkSync(file.path);
    console.log(" scanning ");
    const scanResult = await runScan(workspacePath);

     await Project.findByIdAndUpdate(project._id, {
        fileTree: scanResult.fileTree,
        normalizedIssues: scanResult.normalizedIssues,
        status: "ANALYSING THROUGHPUT"
      });
    console.log(" Gemini delegated ");
   
    
    
  
    
    if (scanResult.normalizedIssues.length > 0) {
      enrichWithGemini(scanResult.normalizedIssues)
        .then(async (geminiRes) => {
            console.log(" COMPLETED ");
          await Project.findByIdAndUpdate(project._id, {
            gemini: { status: "COMPLETED", response: geminiRes },
            status:"COMPLETED"
          });
        })
        .catch(async () => {
          await Project.findByIdAndUpdate(project._id, {
            gemini: { status: "FAILED" },
            status:"FAILED"
          });
        });
    }
    
    res.status(200).json({
      message: "Scan completed",
      projectId: project._id,
      result: scanResult
    });

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
        .select("_id name createdAt status")
        .sort({ createdAt: -1 });
        console.log(" propjects : ",projects)
      res.status(200).json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  };

  /**
 * GET /api/projects/:projectId
 * Fetch single project with full data
 */
export const getProjectById = async (req, res) => {
    
    try {
      const { projectId } = req.params;
      
      const currentUserId = req.userId;
      const ownerIdFromQuery = req.query.ownerId; 
     

    const ownerIdToUse = ownerIdFromQuery || currentUserId;

    const project = await Project.findOne({
      _id: projectId,
      userId: ownerIdToUse,
    });

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
  