"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.promiseAllSettledRule = void 0;
exports.promiseAllSettledRule = {
    id: "BROW-010",
    category: "browser",
    severity: "medium",
    target: ["member_expression"],
    analyze(node) {
        if (node.text?.includes("Promise.allSettled")) {
            return "Promise.allSettled is not supported in older browsers";
        }
        return null;
    }
};
