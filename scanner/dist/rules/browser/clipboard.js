"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clipboardRule = void 0;
exports.clipboardRule = {
    id: "BROW-006",
    category: "browser",
    severity: "medium",
    target: ["member_expression"],
    analyze(node) {
        if (node.text?.includes("navigator.clipboard")) {
            return "Clipboard API is not fully supported in all browsers";
        }
        return null;
    }
};
