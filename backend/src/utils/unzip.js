import fs from "fs";
import path from "path";
import unzipper from "unzipper";
import fsExtra from "fs-extra";

export async function unzipToWorkspace(zipPath, projectName) {
  const workspaceRoot = "temp/workspace";
  const workspacePath = path.join(
    workspaceRoot,
    `${projectName}-${Date.now()}`
  );

  await fsExtra.ensureDir(workspacePath);

  return new Promise((resolve, reject) => {
    fs.createReadStream(zipPath)
      .pipe(unzipper.Extract({ path: workspacePath }))
      .on("close", () => resolve(workspacePath))
      .on("error", reject);
  });
}
