"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evalRule = void 0;
exports.evalRule = {
    id: "SEC-001",
    category: "security",
    severity: "high",
    target: ["call_expression"],
    analyze(node) {
        const fn = node.childForFieldName("function");
        if (fn?.text === "eval") {
            return "Use of eval() detected — potential code injection risk.";
        }
        return null;
    }
};
