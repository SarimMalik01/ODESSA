"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalChainingRule = void 0;
exports.optionalChainingRule = {
    id: "BROW-001",
    category: "browser",
    severity: "medium",
    target: ["optional_chain"],
    analyze() {
        return "Optional chaining is not supported in older browsers (Safari < 13.1)";
    }
};
