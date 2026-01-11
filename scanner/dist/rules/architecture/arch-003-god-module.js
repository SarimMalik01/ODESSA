"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectGodModules = detectGodModules;
function detectGodModules(ctx) {
    const fanIn = new Map();
    for (const [from, deps] of ctx.dependencies.entries()) {
        for (const to of deps) {
            fanIn.set(to, (fanIn.get(to) ?? 0) + 1);
        }
    }
    const issues = [];
    for (const file of ctx.files) {
        const inCount = fanIn.get(file) ?? 0;
        const outCount = ctx.dependencies.get(file)?.size ?? 0;
        if (inCount > 5 || outCount > 5) {
            issues.push({
                id: "ARCH-003",
                severity: "medium",
                message: "God module detected (high fan-in / fan-out)",
                module: file,
                fanIn: inCount,
                fanOut: outCount
            });
        }
    }
    return issues;
}
