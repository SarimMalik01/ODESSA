"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runPerformanceRules = runPerformanceRules;
const map_in_loop_1 = require("./map-in-loop");
const dom_in_loop_1 = require("./dom-in-loop");
const nested_loop_1 = require("./nested-loop");
const function_in_loop_1 = require("./function-in-loop");
function runPerformanceRules(ctx) {
    const allIssues = [
        ...(0, map_in_loop_1.perf001_mapInLoop)(ctx),
        ...(0, dom_in_loop_1.perf002_domInLoop)(ctx),
        ...(0, nested_loop_1.perf003_nestedLoops)(ctx),
        ...(0, function_in_loop_1.perf004_functionInLoop)(ctx)
    ];
    // 🔑 DEDUPLICATION (per file, per rule)
    const seen = new Set();
    const deduped = [];
    for (const issue of allIssues) {
        const key = `${issue.id}:${issue.node?.startPosition?.row ?? "file"}`;
        if (seen.has(key))
            continue;
        seen.add(key);
        deduped.push(issue);
    }
    return deduped;
}
