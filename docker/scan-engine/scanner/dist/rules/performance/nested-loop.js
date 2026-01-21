"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.perf003_nestedLoops = perf003_nestedLoops;
function perf003_nestedLoops(ctx) {
    return Array.from(ctx.nestedLoops).map(() => ({
        id: "PERF-003",
        severity: "high",
        message: "Nested loop detected"
    }));
}
