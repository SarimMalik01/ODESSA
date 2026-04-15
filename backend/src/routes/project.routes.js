import express from "express";
import { uploadZip } from "../middleware/upload.middleware.js";
import { getAllProjects,uploadProject,getProjectById ,getLatestProjectStatus,getActiveProject,markProjectAsSeen} from "../controllers/project.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { createShareLink,accessSharedProject,getSharedProjects,markAllCommentsRead } from "../controllers/sharedProject.controller.js";

const router = express.Router();

router.post("/upload", requireAuth,uploadZip, uploadProject);
router.get("/", requireAuth, getAllProjects);
router.get("/active", requireAuth, getActiveProject);

router.get(
    "/latest/status",
    requireAuth,
    getLatestProjectStatus
  );
  
router.get("/shared", requireAuth, getSharedProjects);


router.post(
    "/mark-all-read",
    requireAuth,
    markAllCommentsRead
  );
  

  router.post(
    "/:projectId/seen",
    requireAuth,
    markProjectAsSeen
  );


router.post(
    "/:projectId/share",
    requireAuth,
    createShareLink
  );

router.get("/:projectId", requireAuth, getProjectById);

router.get(
    "/shared/:token",
    requireAuth,
    accessSharedProject
  );


  



export default router;
