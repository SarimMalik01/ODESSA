import Comment from "../models/comment.model.js";
import SharedProject from "../models/sharedProject.model.js";
import Project from "../models/summary.db.js";
import { User } from "../models/User.model.js";
import mongoose from "mongoose";
export const addComment = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { content, tag } = req.body;
    const userId = req.userId;

    
    const isOwner = await Project.exists({
      _id: projectId,
      userId,
    });

    const isShared = await SharedProject.exists({
      projectId,
      $or: [
        { "owner.userId": userId },
        { "recipients.userId": userId },
      ],
    });

    if (!isOwner && !isShared) {
      return res.status(403).json({ message: "Access denied" });
    }

    const user = await User.findById(userId).select("email");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const comment = await Comment.create({
      projectId,
      author: {
        userId,
        email: user.email,
      },
      content,
      tag,
    });

    res.status(201).json(comment);
  } catch (err) {
    console.error("Add comment error:", err);
    res.status(500).json({ message: "Failed to add comment" });
  }
};


export const getCommentsByProject = async (req, res) => {
    try {
      const { projectId } = req.params;
  
      const comments = await Comment.find({ projectId })
        .sort({ createdAt: 1 })
        .lean();
  
      res.json(comments);
    } catch (err) {
      console.error("Fetch comments error:", err);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  };


  export const getUnreadComments = async (req, res) => {
    try {
      const userId = req.userId;
  
     
      const sharedProjects = await SharedProject.find({
        "recipients.userId": userId,
        status: "active",
      })
        .select("projectId recipients")
        .lean();
  
      if (!sharedProjects.length) {
        return res.json([]);
      }
  
      const projectAccessMap = new Map();
  
      for (const sp of sharedProjects) {
        const recipient = sp.recipients.find(
          (r) => r.userId.toString() === userId.toString()
        );
  
        if (recipient) {
          projectAccessMap.set(
            sp.projectId.toString(),
            recipient.accessedAt || new Date(0)
          );
        }
      }
  
      if (projectAccessMap.size === 0) {
        return res.json([]);
      }
  
      
      const projectIds = Array.from(projectAccessMap.keys()).map(
        (id) => new mongoose.Types.ObjectId(id)
      );
  
     
      const projects = await Project.find({
        _id: { $in: projectIds },
      })
        .select("name")
        .lean();
  
      const projectNameMap = new Map(
        projects.map((p) => [p._id.toString(), p.name])
      );
  
      const comments = await Comment.find({
        projectId: { $in: projectIds },
      }).lean();
  
      
      const unreadByProjectMap = new Map();
  
      for (const comment of comments) {
        const projectIdStr = comment.projectId.toString();
        const lastSeenAt = projectAccessMap.get(projectIdStr);
  
        if (!lastSeenAt) continue;
  
        if (new Date(comment.createdAt) > new Date(lastSeenAt)) {
          if (!unreadByProjectMap.has(projectIdStr)) {
            unreadByProjectMap.set(projectIdStr, {
              projectId: comment.projectId,
              projectName: projectNameMap.get(projectIdStr) || "Unknown Project",
              unreadCount: 0,
              comments: [],
            });
          }
  
          const entry = unreadByProjectMap.get(projectIdStr);
          entry.unreadCount += 1;
          entry.comments.push(comment);
        }
      }
  
      res.status(200).json(
        Array.from(unreadByProjectMap.values())
      );
    } catch (error) {
      console.error("Error fetching unread comments:", error);
      res.status(500).json({
        message: "Failed to fetch unread comments",
      });
    }
  };
  
  