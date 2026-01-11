"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hardcodedSecretRule = void 0;
const SECRET_REGEX = /(api[_-]?key|secret|token|password)/i;
exports.hardcodedSecretRule = {
    id: "SEC-003",
    category: "security",
    severity: "medium",
    target: ["variable_declarator"],
    analyze(node) {
        const name = node.childForFieldName("name")?.text;
        const value = node.childForFieldName("value")?.text;
        if (name &&
            value &&
            SECRET_REGEX.test(name) &&
            value.startsWith('"')) {
            return "Possible hardcoded secret detected.";
        }
        return null;
    }
};
