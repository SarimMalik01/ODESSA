import Project from "../models/summary.db.js";
import {User} from "../models/User.model.js";

export const getUserProfileAnalytics = async (req, res) => {
  try {
    const userId = req.userId;
   
  
    const user = await User.findById(userId, { email: 1 }).lean();
   
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    
    const projects = await Project.find(
      { userId },
      {
        normalizedIssues: 1,
        createdAt: 1,
      }
    ).lean();

   
    const issuesByCategory = {
      architecture: 0,
      security: 0,
      performance: 0,
      browser: 0,
    };

   
    const uploadsByMonth = {
      Jan: 0, Feb: 0, Mar: 0, Apr: 0,
      May: 0, Jun: 0, Jul: 0, Aug: 0,
      Sep: 0, Oct: 0, Nov: 0, Dec: 0,
    };

    for (const project of projects) {

      
      if (Array.isArray(project.normalizedIssues)) {
        for (const issue of project.normalizedIssues) {
          const category = issue.category;
          if (issuesByCategory[category] !== undefined) {
            issuesByCategory[category]++;
          }
        }
      }

     
      if (project.createdAt) {
        const month = new Date(project.createdAt)
          .toLocaleString("en-US", { month: "short" });

        if (uploadsByMonth[month] !== undefined) {
          uploadsByMonth[month]++;
        }
      }
    }

    
    return res.status(200).json({
      email: user.email,
      issuesByCategory,
      uploadsByMonth,
    });

  } catch (error) {
    console.error("Profile analytics error:", error);
    return res.status(500).json({
      message: "Failed to fetch profile analytics",
    });
  }
};
