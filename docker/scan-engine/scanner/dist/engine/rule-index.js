"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.indexRules = indexRules;
function indexRules(rules) {
    const index = new Map();
    for (const rule of rules) {
        for (const target of rule.target) {
            if (!index.has(target))
                index.set(target, []);
            index.get(target).push(rule);
        }
    }
    return index;
}
