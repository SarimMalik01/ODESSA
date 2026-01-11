"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanFiles = scanFiles;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const SUPPORTED_EXTENSIONS = [".ts", ".js"];
async function scanFiles(rootDir) {
    const results = [];
    function walk(dir) {
        const entries = fs_1.default.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path_1.default.join(dir, entry.name);
            if (entry.isDirectory()) {
                if (entry.name === "node_modules" || entry.name.startsWith(".")) {
                    continue;
                }
                walk(fullPath);
            }
            else if (entry.isFile() &&
                SUPPORTED_EXTENSIONS.includes(path_1.default.extname(entry.name))) {
                results.push(fullPath);
            }
        }
    }
    walk(path_1.default.resolve(rootDir));
    return results;
}
