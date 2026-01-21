// import fs from "fs";
// import path from "path";
// import unzipper from "unzipper";
// import fsExtra from "fs-extra";

// export async function unzipToWorkspace(zipPath, projectName) {
//   const workspaceRoot = "temp/workspace";
//   const workspacePath = path.join(
//     workspaceRoot,
//     `${projectName}-${Date.now()}`
//   );

//   await fsExtra.ensureDir(workspacePath);

//   const directory = await unzipper.Open.file(zipPath);

//   for (const entry of directory.files) {
//     const fullPath = path.join(workspacePath, entry.path);

//     if (entry.type === "Directory") {
//       await fsExtra.ensureDir(fullPath);
//     } else {
//       await fsExtra.ensureDir(path.dirname(fullPath));

//       await new Promise((resolve, reject) => {
//         entry
//           .stream()
//           .pipe(fs.createWriteStream(fullPath))
//           .on("finish", resolve)
//           .on("error", reject);
//       });
//     }
//   }

//   return workspacePath;
// }
