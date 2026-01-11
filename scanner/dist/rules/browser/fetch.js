"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchRule = void 0;
exports.fetchRule = {
    id: "BROW-003",
    category: "browser",
    severity: "medium",
    target: ["call_expression"],
    analyze(node) {
        const fn = node.childForFieldName("function");
        if (fn?.text === "fetch") {
            return "Fetch API requires polyfill for older browsers";
        }
        return null;
    }
};
