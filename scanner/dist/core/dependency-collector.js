"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectDependencies = collectDependencies;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
function collectDependencies(node, currentFile, archContext) {
    // ✅ Tree-sitter uses "import_statement"
    if (node.type !== "import_statement")
        return;
    const sourceNode = node.childForFieldName("source");
    if (!sourceNode)
        return;
    const rawImport = sourceNode.text.replace(/['"]/g, "");
    // ignore node_modules / external imports
    if (!rawImport.startsWith("."))
        return;
    const basePath = path_1.default.resolve(path_1.default.dirname(currentFile), rawImport);
    let resolvedPath = null;
    if (fs_1.default.existsSync(basePath + ".ts")) {
        resolvedPath = basePath + ".ts";
    }
    else if (fs_1.default.existsSync(path_1.default.join(basePath, "index.ts"))) {
        resolvedPath = path_1.default.join(basePath, "index.ts");
    }
    if (!resolvedPath)
        return;
    archContext.addDependency(currentFile, resolvedPath);
}
