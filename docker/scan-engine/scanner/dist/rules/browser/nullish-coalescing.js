"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nullishCoalescingRule = void 0;
exports.nullishCoalescingRule = {
    id: "BROW-002",
    category: "browser",
    severity: "medium",
    target: ["binary_expression"],
    analyze(node) {
        if (node.text?.includes("??")) {
            return "Nullish coalescing is not supported in older browsers (Safari < 13)";
        }
        return null;
    }
};
