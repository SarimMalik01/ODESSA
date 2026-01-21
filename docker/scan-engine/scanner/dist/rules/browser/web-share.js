"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webShareRule = void 0;
exports.webShareRule = {
    id: "BROW-007",
    category: "browser",
    severity: "medium",
    target: ["member_expression"],
    analyze(node) {
        if (node.text?.includes("navigator.share")) {
            return "Web Share API works only on mobile & modern browsers";
        }
        return null;
    }
};
