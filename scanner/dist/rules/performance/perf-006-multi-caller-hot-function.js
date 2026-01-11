"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectMultiCallerHotFunctions = detectMultiCallerHotFunctions;
function detectMultiCallerHotFunctions(summaries) {
    const issues = [];
    // functionName -> callers
    const callersMap = new Map();
    for (const [file, summary] of summaries.entries()) {
        for (const fn of summary.callsInsideLoops) {
            if (!callersMap.has(fn)) {
                callersMap.set(fn, new Set());
            }
            callersMap.get(fn).add(file);
        }
    }
    for (const [fn, callersSet] of callersMap.entries()) {
        if (callersSet.size > 1) {
            issues.push({
                id: "PERF-006",
                severity: "high",
                message: `Expensive function '${fn}' is called inside loops from multiple files`,
                function: fn,
                callers: Array.from(callersSet)
            });
        }
    }
    return issues;
}
