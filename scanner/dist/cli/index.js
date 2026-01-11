"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const targetPath = process.argv[2];
if (!targetPath) {
    console.error("❌ Please provide a directory path to scan");
    process.exit(1);
}
(0, index_1.runScan)(targetPath).catch(err => {
    console.error("Scan failed:", err);
    process.exit(1);
});
