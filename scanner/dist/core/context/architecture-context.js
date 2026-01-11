"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArchitectureContext = void 0;
class ArchitectureContext {
    constructor() {
        this.files = new Set();
        // file → dependencies
        this.dependencies = new Map();
        // function → defining file
        this.functionOwners = new Map();
        // layer config cache
        this.layerMap = new Map();
    }
    addFile(file) {
        this.files.add(file);
        if (!this.dependencies.has(file)) {
            this.dependencies.set(file, new Set());
        }
    }
    addDependency(from, to) {
        if (!this.dependencies.has(from)) {
            this.dependencies.set(from, new Set());
        }
        this.dependencies.get(from).add(to);
    }
    // ✅ NEW
    registerFunction(functionName, file) {
        this.functionOwners.set(functionName, file);
    }
    // ✅ NEW
    getFunctionOwner(functionName) {
        return this.functionOwners.get(functionName);
    }
    // ✅ used by ARCH-005 / ARCH-006
    getLayer(file) {
        const normalized = file.replace(/\\/g, "/");
        if (normalized.includes("/ui/"))
            return "ui";
        if (normalized.includes("/service/"))
            return "service";
        if (normalized.includes("/domain/"))
            return "domain";
        if (normalized.includes("/core/"))
            return "core";
        return null;
    }
}
exports.ArchitectureContext = ArchitectureContext;
