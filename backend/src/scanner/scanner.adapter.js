import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const scannerPath = path.resolve(
  __dirname,
  "../../../scanner/dist/index.js"
);

export async function runScan(workspacePath) {
  try {
    // 🔑 convert Windows path → file:// URL
    const scannerUrl = pathToFileURL(scannerPath).href;

    const scannerModule = await import(scannerUrl);

    return await scannerModule.runScan(workspacePath);
  } catch (err) {
    console.error("🔥 Scanner crash:", err);
    throw err;
  }
}
