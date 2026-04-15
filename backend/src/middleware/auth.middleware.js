import jwt from "jsonwebtoken";
import { User } from "../models/User.model.js";

export const requireAuth = async (req, res, next) => {
  try {
    
    const token = req.cookies.session;
    

    if (!token) {
      return res.status(401).json({ message: "Not authenticated buffon" });
    }
  
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user=await User.findById(decoded.userId).select("_id email");
    req.userId = decoded.userId;
    req.user=user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid session" });
  }
};
