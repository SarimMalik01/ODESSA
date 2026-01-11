"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.perf004_functionInLoop = perf004_functionInLoop;
function perf004_functionInLoop(ctx) {
    return ctx.expensiveOpsInLoops
        .filter(record => record.type === "Function declaration")
        .map(record => ({
        id: "PERF-004",
        severity: record.loopDepth > 1 ? "high" : "medium",
        node: record.node,
        message: "Function defined inside loop causes repeated allocations"
    }));
}
