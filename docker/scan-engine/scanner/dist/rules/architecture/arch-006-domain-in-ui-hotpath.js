"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectDomainLogicInUIHotPath = detectDomainLogicInUIHotPath;
function detectDomainLogicInUIHotPath(ctx, summaries) {
    // function → defining file
    const functionOwner = new Map();
    for (const [file, summary] of summaries.entries()) {
        for (const fn of summary.functionsDefined) {
            functionOwner.set(fn, file);
        }
    }
    const issues = [];
    for (const [uiFile, uiSummary] of summaries.entries()) {
        if (ctx.getLayer(uiFile) !== "ui")
            continue;
        for (const fn of uiSummary.calledFunctions) {
            // ❌ skip loop cases (ARCH-005)
            if (uiSummary.callsInsideLoops.has(fn))
                continue;
            const owner = functionOwner.get(fn);
            if (!owner)
                continue;
            if (ctx.getLayer(owner) !== "domain")
                continue;
            if (!summaries.get(owner)?.expensiveFunctions.has(fn))
                continue;
            issues.push({
                id: "ARCH-006",
                severity: "medium",
                message: `Expensive domain logic '${fn}' executed directly in UI hot path`,
                from: uiFile,
                to: owner,
                functionName: fn,
                callers: [uiFile]
            });
        }
    }
    return issues;
}
