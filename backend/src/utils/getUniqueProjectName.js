import Project from "../models/summary.db.js";
export async function getUniqueProjectName(userId, baseName) {
    // Regex to match:
    // myportfolio
    // myportfolio(1)
    // myportfolio(2)
    const regex = new RegExp(`^${baseName}(\\(\\d+\\))?$`);
  
    const projects = await Project.find(
      { userId, name: { $regex: regex } },
      { name: 1 }
    );
  
    if (projects.length === 0) {
      return baseName;
    }
  
    let maxSuffix = 0;
  
    for (const p of projects) {
      const match = p.name.match(/\((\d+)\)$/);
      if (match) {
        maxSuffix = Math.max(maxSuffix, Number(match[1]));
      }
    }
  
    return `${baseName}(${maxSuffix + 1})`;
  }
  