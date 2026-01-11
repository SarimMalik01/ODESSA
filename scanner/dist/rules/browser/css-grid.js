"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cssGridRule = void 0;
exports.cssGridRule = {
    id: "BROW-008",
    category: "browser",
    severity: "low",
    target: ["string"],
    analyze(node) {
        if (node.text?.includes("display: grid")) {
            return "CSS Grid has limited support in older browsers (IE)";
        }
        return null;
    }
};
