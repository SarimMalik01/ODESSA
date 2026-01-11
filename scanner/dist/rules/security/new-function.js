"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newFunctionRule = void 0;
exports.newFunctionRule = {
    id: "SEC-004",
    category: "security",
    severity: "high",
    target: ["new_expression"],
    analyze(node) {
        const ctor = node.childForFieldName("constructor");
        if (ctor?.text === "Function") {
            return "Use of new Function() can lead to code injection.";
        }
        return null;
    }
};
