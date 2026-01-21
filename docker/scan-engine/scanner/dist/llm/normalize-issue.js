"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeIssues = normalizeIssues;
function normalizeIssues(architectureIssues, performanceIssues, securityIssues, browserIssues) {
    const normalized = [];
    // ================= ARCHITECTURE =================
    for (const issue of architectureIssues) {
        normalized.push({
            id: issue.id,
            category: "architecture",
            severity: issue.severity,
            title: issue.message,
            description: issue.message,
            related: {
                function: issue.functionName,
                fromFile: issue.from,
                toFile: issue.to
            },
            evidence: issue
        });
    }
    // ================= PERFORMANCE =================
    for (const issue of performanceIssues) {
        normalized.push({
            id: issue.id,
            category: "performance",
            severity: issue.severity,
            title: issue.message,
            description: issue.message,
            location: issue.toFile
                ? { file: issue.toFile }
                : undefined,
            related: {
                function: issue.function,
                fromFile: issue.fromFile,
                toFile: issue.toFile,
                callers: issue.callers
            },
            evidence: issue
        });
    }
    // ================= SECURITY =================
    for (const issue of securityIssues) {
        normalized.push({
            id: issue.id,
            category: "security",
            severity: issue.severity,
            title: issue.message,
            description: issue.message,
            location: {
                file: issue.file,
                line: issue.line
            },
            evidence: issue
        });
    }
    // ================= BROWSER =================
    for (const issue of browserIssues) {
        normalized.push({
            id: issue.id,
            category: "browser",
            severity: issue.severity,
            title: issue.message,
            description: issue.message,
            location: {
                file: issue.file,
                line: issue.line
            },
            evidence: issue
        });
    }
    return normalized;
}
