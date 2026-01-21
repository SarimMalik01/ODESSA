"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.perf002_domInLoop = perf002_domInLoop;
function perf002_domInLoop(ctx) {
    return ctx.domCallsInLoops.map(record => ({
        id: "PERF-002",
        severity: "medium",
        node: record.node,
        message: `DOM access '${record.api}' inside a loop may cause layout thrashing`
    }));
}
