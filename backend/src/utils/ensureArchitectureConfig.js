import fs from "fs";
import path from "path";
import { DEFAULT_ARCH_CONFIG } from "../constants/architectureTemplate.js";

export function ensureArchitectureConfig(projectRoot) {
  const configPath = path.join(projectRoot, "architecture.config.json");

  if (fs.existsSync(configPath)) {
    console.log("🧱 architecture.config.json already exists");
    return;
  }

  fs.writeFileSync(
    configPath,
    JSON.stringify(DEFAULT_ARCH_CONFIG, null, 2),
    "utf-8"
  );

  console.log("🧱 architecture.config.json created");
}
