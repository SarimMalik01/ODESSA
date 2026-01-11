import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = "temp/uploads";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (_req, file, cb) => {
    const allowed = [
      "application/zip",
      "application/x-zip-compressed",
      "application/octet-stream",
    ];
  
    const ext = path.extname(file.originalname).toLowerCase();
  
    if (allowed.includes(file.mimetype) && ext === ".zip") {
      cb(null, true);
    } else {
      cb(new Error("Only ZIP files are allowed"));
    }
  };
  

export const uploadZip = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
}).single("file");
