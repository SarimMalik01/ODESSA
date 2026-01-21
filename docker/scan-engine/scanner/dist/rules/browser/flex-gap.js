"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flexGapRule = void 0;
exports.flexGapRule = {
    id: "BROW-009",
    category: "browser",
    severity: "medium",
    target: ["string"],
    analyze(node) {
        if (node.text?.includes("gap")) {
            return "Flexbox gap is not supported in older Safari versions";
        }
        return null;
    }
};
