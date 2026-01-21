"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectUnstableDependencies = detectUnstableDependencies;
function detectUnstableDependencies(ctx) {
    const fanIn = new Map();
    const fanOut = new Map();
    for (const file of ctx.files) {
        fanIn.set(file, 0);
        fanOut.set(file, ctx.dependencies.get(file)?.size ?? 0);
    }
    for (const [from, deps] of ctx.dependencies.entries()) {
        for (const to of deps) {
            fanIn.set(to, (fanIn.get(to) ?? 0) + 1);
        }
    }
    const instability = new Map();
    for (const file of ctx.files) {
        const i = fanOut.get(file) / ((fanIn.get(file) + fanOut.get(file)) || 1);
        instability.set(file, Number(i.toFixed(2)));
    }
    const issues = [];
    for (const [from, deps] of ctx.dependencies.entries()) {
        const fromI = instability.get(from);
        if (fromI > 0.3)
            continue;
        for (const to of deps) {
            const toI = instability.get(to);
            if (toI >= 0.7) {
                issues.push({
                    id: "ARCH-004",
                    severity: "high",
                    message: "Stable module depends on unstable module (dependency stability violation)",
                    from,
                    to,
                    fromInstability: fromI,
                    toInstability: toI
                });
            }
        }
    }
    return issues;
}
