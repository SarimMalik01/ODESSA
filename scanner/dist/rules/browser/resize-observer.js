"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resizeObserverRule = void 0;
exports.resizeObserverRule = {
    id: "BROW-005",
    category: "browser",
    severity: "medium",
    target: ["new_expression"],
    analyze(node) {
        if (node.text?.includes("ResizeObserver")) {
            return "ResizeObserver has limited support in older browsers";
        }
        return null;
    }
};
