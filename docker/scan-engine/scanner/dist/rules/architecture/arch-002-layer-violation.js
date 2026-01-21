"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectLayerViolations = detectLayerViolations;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/**
 * Load architecture config from the PROJECT ROOT (workspace)
 */
function loadConfig(projectRoot) {
    const configPath = path_1.default.join(projectRoot, "architecture.config.json");
    if (!fs_1.default.existsSync(configPath)) {
        return null; // config is optional
    }
    return JSON.parse(fs_1.default.readFileSync(configPath, "utf-8"));
}
function getLayer(file, layers) {
    const normalized = file.replace(/\\/g, "/");
    for (const layer of layers) {
        if (normalized.includes(layer.path)) {
            return layer.name;
        }
    }
    return null;
}
function detectLayerViolations(ctx, projectRoot) {
    const config = loadConfig(projectRoot);
    if (!config)
        return []; // 👈 IMPORTANT: no config, no crash
    const { layers, rules } = config;
    const direction = rules.direction;
    const issues = [];
    for (const [from, deps] of ctx.dependencies.entries()) {
        const fromLayer = getLayer(from, layers);
        if (!fromLayer)
            continue;
        for (const to of deps) {
            const toLayer = getLayer(to, layers);
            if (!toLayer)
                continue;
            const fromIndex = direction.indexOf(fromLayer);
            const toIndex = direction.indexOf(toLayer);
            if (fromIndex === -1 || toIndex === -1)
                continue;
            // ❌ illegal upward dependency
            if (toIndex < fromIndex) {
                issues.push({
                    id: "ARCH-002",
                    severity: "high",
                    message: `Layer violation: '${fromLayer}' must not depend on '${toLayer}'`,
                    from,
                    to
                });
            }
        }
    }
    return issues;
}
