"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectCircularDependencies = detectCircularDependencies;
function detectCircularDependencies(ctx) {
    const visited = new Set();
    const stack = new Set();
    const issues = [];
    function dfs(node, path) {
        if (stack.has(node)) {
            issues.push({
                id: "ARCH-001",
                severity: "high",
                message: "Circular dependency detected",
                cycle: [...path, node]
            });
            return;
        }
        if (visited.has(node))
            return;
        visited.add(node);
        stack.add(node);
        for (const dep of ctx.dependencies.get(node) ?? []) {
            dfs(dep, [...path, dep]);
        }
        stack.delete(node);
    }
    for (const file of ctx.files) {
        dfs(file, [file]);
    }
    return issues;
}
