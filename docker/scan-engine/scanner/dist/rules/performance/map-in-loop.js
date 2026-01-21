"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.perf001_mapInLoop = perf001_mapInLoop;
function perf001_mapInLoop(ctx) {
    return ctx.expensiveOpsInLoops
        .filter(record => record.type.endsWith(".map") ||
        record.type.endsWith(".filter") ||
        record.type.endsWith(".reduce"))
        .map(record => ({
        id: "PERF-001",
        severity: record.loopDepth > 1 ? "high" : "medium",
        node: record.node,
        message: `${record.type} used inside a loop (depth ${record.loopDepth})`
    }));
}
