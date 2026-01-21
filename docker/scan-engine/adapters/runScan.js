import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔑 create CommonJS require inside ESM
const require = createRequire(import.meta.url);

const scannerPath = path.resolve(
  __dirname,
  "../scanner/dist/index.js"
);

// ✅ Load scanner as CommonJS
const scannerModule = require(scannerPath);

export async function runScan(workspacePath) {
  try {
    return await scannerModule.runScan(workspacePath);
  } catch (err) {
    console.error("🔥 Scanner crash:", err);
    throw err;
  }
}
