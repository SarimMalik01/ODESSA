"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectDomainLogicInUILoops = detectDomainLogicInUILoops;
function detectDomainLogicInUILoops(archContext, summaries) {
    const issues = [];
    // function → defining file
    const functionOwner = new Map();
    for (const summary of summaries.values()) {
        for (const fn of summary.functionsDefined) {
            functionOwner.set(fn, summary.file);
        }
    }
    for (const summary of summaries.values()) {
        // only UI files
        if (archContext.getLayer(summary.file) !== "ui")
            continue;
        // only calls that happened INSIDE loops
        for (const fn of summary.callsInsideLoops) {
            const owner = functionOwner.get(fn);
            if (!owner)
                continue;
            // domain logic
            if (archContext.getLayer(owner) !== "domain")
                continue;
            issues.push({
                id: "ARCH-005",
                severity: "high",
                message: `Domain logic '${fn}' executed inside UI loop`,
                from: summary.file,
                to: owner,
                functionName: fn
            });
        }
    }
    return issues;
}
