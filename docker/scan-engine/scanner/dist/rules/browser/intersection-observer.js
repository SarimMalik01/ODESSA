"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.intersectionObserverRule = void 0;
exports.intersectionObserverRule = {
    id: "BROW-004",
    category: "browser",
    severity: "medium",
    target: ["new_expression"],
    analyze(node) {
        if (node.text?.includes("IntersectionObserver")) {
            return "IntersectionObserver is not supported in older Safari and IE";
        }
        return null;
    }
};
