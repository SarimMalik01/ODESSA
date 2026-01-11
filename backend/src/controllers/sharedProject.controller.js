import crypto from "crypto";
import SharedProject from "../models/sharedProject.model.js";
import Project from "../models/summary.db.js";
import { User } from "../models/User.model.js";
import mongoose from "mongoose";

export const createShareLink = async (req, res) => {
    try {
      const { projectId } = req.params;
      const { expiryDate } = req.body;
      const userId = req.userId;
  
      // 🔹 Verify project ownership
      const project = await Project.findOne({
        _id: projectId,
        userId,
      });
  
      if (!project) {
        return res
          .status(404)
          .json({ message: "Project not found or access denied" });
      }
  
      // 🔹 Fetch owner email ONCE
      const ownerUser = await User.findById(userId).select("email");
      if (!ownerUser) {
        return res.status(404).json({ message: "Owner not found" });
      }
  
      const sharedToken = crypto.randomBytes(32).toString("hex");
  
      const expiresAt = expiryDate
        ? new Date(expiryDate)
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  
        const sharedProject = await SharedProject.create({
            projectId,
            owner: {
              userId,
              email: ownerUser.email,
            },
            sharedToken,
            expiresAt,
            recipients: [
              {
                userId,
                email: ownerUser.email,
                accessedAt: new Date(),
              },
            ],
          });
  
      res.status(201).json({
        shareUrl: `http://localhost:5173/report/shared/${sharedToken}`,
        expiresAt: sharedProject.expiresAt,
      });
    } catch (err) {
      console.error("Create share link error:", err);
      res.status(500).json({ message: "Failed to create share link" });
    }
  };


  export const accessSharedProject = async (req, res) => {
    try {
      const { token } = req.params;
      const userId = req.userId;
  
      const shared = await SharedProject.findOne({
        sharedToken: token,
        status: "active",
      });
  
      if (!shared) {
        return res.status(404).json({ message: "Invalid or expired share link" });
      }
  
      // 🔒 Expiry check
      if (shared.expiresAt < new Date()) {
        shared.status = "expired";
        await shared.save();
        return res.status(410).json({ message: "Share link expired" });
      }
  
      // 👤 Fetch user email
      const user = await User.findById(userId).select("email");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // 🔁 Find recipient
      const recipient = shared.recipients.find(
        (r) => r.userId.toString() === userId
      );
      console.log(" recipient : ",recipient);
      if (recipient) {
        // ✅ UPDATE lastSeenAt on EVERY access
        recipient.accessedAt = new Date();
      } else {
        // ➕ First-time access
        shared.recipients.push({
          userId,
          email: user.email,
          accessedAt: new Date(),
        });
      }
  
      await shared.save();
  
      // ✅ Respond with shared context
      res.json({
        projectId: shared.projectId,
        ownerId: shared.owner.userId,
        shared: true,
      });
    } catch (err) {
      console.error("Access shared project error:", err);
      res.status(500).json({ message: "Failed to access shared project" });
    }
  };
  
  
 
 
  export const getSharedProjects = async (req, res) => {
    try {
      const userId = req.userId.toString();
  
      console.log("\n===============================");
      console.log("GET SHARED PROJECTS");
      console.log("Current userId:", userId);
      console.log("===============================\n");
  
      /* ======================
         Projects shared BY me
      ====================== */
      const sharedByMeDocs = await SharedProject.find({
        "owner.userId": userId,
        status: "active",
      })
        .populate("projectId", "name createdAt")
        .lean();
  
      console.log("Shared BY me docs count:", sharedByMeDocs.length);
  
      /* =========================
         Projects shared WITH me
      ========================= */
      const sharedWithMeDocs = await SharedProject.find({
        "recipients.userId": userId,
        status: "active",
      })
        .populate("projectId", "name createdAt")
        .lean();
  
      console.log("Shared WITH me docs (raw):", sharedWithMeDocs.length);
  
      /* ======================
         Normalize: Shared by me
      ====================== */
      const sharedByMe = sharedByMeDocs
        .filter((doc) => doc.projectId)
        .map((doc) => ({
          _id: doc.projectId._id,
          name: doc.projectId.name,
          createdAt: doc.projectId.createdAt,
          recipients: doc.recipients,
          owner: doc.owner,
        }));
  
      /* ==========================
         Normalize: Shared with me
         (DEBUG FILTERING)
      ========================== */
      const sharedWithMe = sharedWithMeDocs
  .filter((doc) => {
    if (!doc.projectId) return false;

    const ownerId = doc.owner.userId.toString();
    const currentUserId = userId.toString();

    console.log("\n--- Evaluating sharedWithMe doc ---");
    console.log("Project:", doc.projectId._id.toString());
    console.log("OwnerId:", ownerId);
    console.log("CurrentUserId:", currentUserId);

    // 🚫 RULE: Owner should never see his own project in "shared with me"
    if (ownerId === currentUserId) {
      console.log("❌ Excluded: current user is owner");
      return false;
    }

    console.log("✅ Included in sharedWithMe");
    return true;
  })
  .map((doc) => ({
    _id: doc.projectId._id,
    name: doc.projectId.name,
    createdAt: doc.projectId.createdAt,
    owner: doc.owner,
  }));

  
      console.log("\n===============================");
      console.log("FINAL COUNTS");
      console.log("sharedByMe:", sharedByMe.length);
      console.log("sharedWithMe:", sharedWithMe.length);
      console.log("===============================\n");
  
      res.json({ sharedByMe, sharedWithMe });
    } catch (error) {
      console.error("❌ Error fetching shared projects:", error);
      res.status(500).json({
        message: "Failed to fetch shared projects",
      });
    }
  };
  

  export const markAllCommentsRead = async (req, res) => {
    try {
      const userId = req.userId;
      const now = new Date();
  
      await SharedProject.updateMany(
        {
          status: "active",
          $or: [
            { "owner.userId": userId },
            { "recipients.userId": userId }
          ]
        },
        {
          $set: {
            "recipients.$[r].accessedAt": now
          }
        },
        {
          arrayFilters: [{ "r.userId": userId }]
        }
      );
  
      res.status(200).json({ success: true });
    } catch (err) {
      console.error("Mark all read error:", err);
      res.status(500).json({ message: "Failed to mark all as read" });
    }
  };
  
  
  