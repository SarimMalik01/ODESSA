"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.innerHTMLRule = void 0;
exports.innerHTMLRule = {
    id: "SEC-002",
    category: "security",
    severity: "medium",
    target: ["assignment_expression"],
    analyze(node) {
        const left = node.childForFieldName("left");
        if (left?.text?.endsWith(".innerHTML")) {
            return "Assignment to innerHTML can lead to XSS vulnerabilities.";
        }
        return null;
    }
};
