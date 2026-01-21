"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectCrossFileHotFunctions = detectCrossFileHotFunctions;
function detectCrossFileHotFunctions(summaries) {
    const issues = [];
    // --------------------------------------------------
    // 1️⃣ Map function → defining file
    // --------------------------------------------------
    const functionOwner = new Map();
    for (const [file, summary] of summaries.entries()) {
        for (const fn of summary.functionsDefined) {
            functionOwner.set(fn, file);
        }
    }
    // --------------------------------------------------
    // 2️⃣ Find cross-file calls inside loops
    // --------------------------------------------------
    for (const [callerFile, callerSummary] of summaries.entries()) {
        for (const calledFn of callerSummary.callsInsideLoops) {
            const ownerFile = functionOwner.get(calledFn);
            if (!ownerFile)
                continue;
            // same-file call → ignore
            if (ownerFile === callerFile)
                continue;
            const ownerSummary = summaries.get(ownerFile);
            if (!ownerSummary)
                continue;
            // only expensive functions matter
            if (!ownerSummary.expensiveFunctions.has(calledFn))
                continue;
            issues.push({
                id: "PERF-005",
                severity: "high",
                message: `Expensive function '${calledFn}' defined in ${ownerFile} ` +
                    `is called inside a loop in ${callerFile}`,
                fromFile: ownerFile,
                toFile: callerFile,
                function: calledFn
            });
        }
    }
    return issues;
}
