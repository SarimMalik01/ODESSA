"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectPerformanceSignals = collectPerformanceSignals;
function collectPerformanceSignals(node, ctx) {
    // ================================
    // PERF-004: function inside loop
    // ================================
    if (ctx.loopDepth > 0 &&
        (node.type === "function_declaration" ||
            node.type === "function_expression" ||
            node.type === "arrow_function")) {
        ctx.expensiveOpsInLoops.push({
            node,
            type: "Function declaration",
            loopDepth: ctx.loopDepth
        });
    }
    // ================================
    // Call-expression based signals
    // ================================
    if (node.type !== "call_expression")
        return;
    if (ctx.loopDepth === 0)
        return;
    const fn = node.childForFieldName("function");
    const fnText = fn?.text ?? "";
    // PERF-001
    if (fnText.endsWith(".map") ||
        fnText.endsWith(".filter") ||
        fnText.endsWith(".reduce")) {
        ctx.expensiveOpsInLoops.push({
            node,
            type: fnText,
            loopDepth: ctx.loopDepth
        });
    }
    // PERF-002
    if (fnText.startsWith("document.")) {
        ctx.domCallsInLoops.push({
            node,
            api: fnText,
            loopDepth: ctx.loopDepth
        });
    }
}
