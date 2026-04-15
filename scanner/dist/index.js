"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runScan = runScan;
require("./utils/env");
const build_file_tree_1 = require("./core/fs/build-file-tree");
const chalk_1 = __importDefault(require("chalk"));
const normalize_issue_1 = require("./llm/normalize-issue");
const enrich_findings_1 = require("./llm/enrich-findings");
// ====================
// ARCHITECTURE
// ====================
const architecture_1 = require("./rules/architecture");
const architecture_context_1 = require("./core/context/architecture-context");
const dependency_collector_1 = require("./core/dependency-collector");
// ====================
// SUMMARY
// ====================
const summary_collector_1 = require("./core/summary/summary-collector");
// ====================
// SCANNING + AST
// ====================
const scanner_1 = require("./core/scanner");
const ast_1 = require("./core/ast");
const traverse_1 = require("./core/traverse");
// ====================
// RULE ENGINE
// ====================
const security_1 = require("./rules/security");
const browser_1 = require("./rules/browser");
const rule_index_1 = require("./engine/rule-index");
// ====================
// PERFORMANCE
// ====================
const performance_context_1 = require("./core/context/performance-context");
const performance_signals_1 = require("./core/performance-signals");
const loops_1 = require("./core/loops");
const performance_1 = require("./rules/performance");
const perf_005_cross_file_hot_function_1 = require("./rules/performance/perf-005-cross-file-hot-function");
const perf_006_multi_caller_hot_function_1 = require("./rules/performance/perf-006-multi-caller-hot-function");
// ====================
// ENTRY POINT
// ====================
async function runScan(targetPath) {
    const fileTree = (0, build_file_tree_1.buildFileTree)(targetPath);
    const files = await (0, scanner_1.scanFiles)(targetPath);
    /** collected for normalization */
    const securityIssues = [];
    const browserIssues = [];
    const localPerfIssues = [];
    console.log("FILES SCANNED:");
    files.forEach(f => console.log(" ", f));
    // --------------------
    // GLOBAL CONTEXTS
    // --------------------
    const archContext = new architecture_context_1.ArchitectureContext();
    const summaries = new Map();
    const ruleIndex = (0, rule_index_1.indexRules)([
        ...security_1.securityRules,
        ...browser_1.browserRules
    ]);
    // ======================================================
    // FILE-BY-FILE ANALYSIS
    // ======================================================
    for (const file of files) {
        archContext.addFile(file);
        const summary = (0, summary_collector_1.createFileSummary)(file);
        summaries.set(file, summary);
        const tree = (0, ast_1.parseFile)(file);
        const perfContext = new performance_context_1.PerformanceContext();
        const seenRuleHits = new Set();
        (0, traverse_1.traverse)(tree.rootNode, perfContext, 
        // ====================
        // ENTER NODE
        // ====================
        (node, ctx) => {
            // ---- LOOP TRACKING ----
            if ((0, loops_1.isLoopNode)(node)) {
                ctx.loopDepth++;
                if (ctx.loopDepth > 1) {
                    ctx.nestedLoops.add(`${node.startPosition.row}:${node.startPosition.column}`);
                }
            }
            // ---- FUNCTION DECLARATION ----
            if (node.type === "function_declaration") {
                const nameNode = node.childForFieldName("name");
                if (nameNode) {
                    ctx.currentFunctionName = nameNode.text;
                    summary.functionsDefined.add(nameNode.text);
                    // ARCH-005 / ARCH-006 support
                    archContext.registerFunction(nameNode.text, file);
                }
            }
            // ---- ARCHITECTURE DEPENDENCIES ----
            (0, dependency_collector_1.collectDependencies)(node, file, archContext);
            // ---- PERFORMANCE SIGNALS ----
            (0, performance_signals_1.collectPerformanceSignals)(node, ctx);
            // ---- EXPENSIVE FUNCTION HEURISTIC ----
            if (node.type === "call_expression" &&
                node.text?.includes("JSON.stringify") &&
                ctx.currentFunctionName) {
                summary.expensiveFunctions.add(ctx.currentFunctionName);
            }
            // ---- ALL FUNCTION CALLS ----
            if (node.type === "call_expression") {
                const fn = node.childForFieldName("function");
                if (fn)
                    summary.calledFunctions.add(fn.text);
            }
            // ---- CALLS INSIDE LOOPS ----
            if (ctx.loopDepth > 0 && node.type === "call_expression") {
                const fn = node.childForFieldName("function");
                if (fn)
                    summary.callsInsideLoops.add(fn.text);
            }
            // ---- SECURITY + BROWSER RULES ----
            const applicable = ruleIndex.get(node.type) || [];
            for (const rule of applicable) {
                const result = rule.analyze(node);
                if (!result)
                    continue;
                const line = node.startPosition.row + 1;
                const key = `${rule.id}:${file}:${line}`;
                if (seenRuleHits.has(key))
                    continue;
                seenRuleHits.add(key);
                if (rule.category === "security") {
                    securityIssues.push({
                        id: rule.id,
                        severity: rule.severity,
                        message: result,
                        file,
                        line
                    });
                }
                if (rule.category === "browser") {
                    browserIssues.push({
                        id: rule.id,
                        severity: rule.severity,
                        message: result,
                        file,
                        line
                    });
                }
                // console.log(chalk_1.default.yellow(`${rule.severity === "high" ? "❌" : "⚠️"} ${rule.id} [${rule.severity.toUpperCase()}]`), chalk_1.default.gray(`${file}:${line}`), "\n ", result, "\n");
            }
        }, 
        // ====================
        // EXIT NODE
        // ====================
        (node, ctx) => {
            if ((0, loops_1.isLoopNode)(node))
                ctx.loopDepth--;
            if (node.type === "function_declaration") {
                ctx.currentFunctionName = null;
            }
        });
        // ---- PER-FILE PERFORMANCE RULES ----
        for (const issue of (0, performance_1.runPerformanceRules)(perfContext)) {
            localPerfIssues.push({
                id: issue.id,
                severity: issue.severity,
                message: issue.message,
            
                fromFile: file,   // ✅ keep this tag
            
                line: issue.node?.startPosition.row + 1,
                column: issue.node?.startPosition.column + 1
            });
            
            // console.log(chalk_1.default.yellow(`⚠️ ${issue.id} [${issue.severity.toUpperCase()}]`), chalk_1.default.gray(issue.node
            //     ? `${file}:${issue.node.startPosition.row + 1}`
            //     : file), "\n ", issue.message, "\n");
        }
    }
    // ======================================================
    // ARCHITECTURE RULES (GLOBAL)
    // ======================================================
    const archIssues = (0, architecture_1.runArchitectureRules)(archContext, summaries, targetPath);
    // console.log("ARCH ISSUES FOUND:", archIssues.length);
    // for (const issue of archIssues) {
    //     console.log(chalk_1.default.magenta(`🏗️ ${issue.id} [${issue.severity.toUpperCase()}]`), "\n ", issue.message);
    //     if ("from" in issue)
    //         console.log("  From:", issue.from);
    //     if ("to" in issue)
    //         console.log("  To:  ", issue.to);
    //     if ("functionName" in issue)
    //         console.log("  Function:", issue.functionName);
    //     console.log();
    // }
    // ======================================================
    // CROSS-FILE PERFORMANCE
    // ======================================================
    const crossFilePerfIssues = [
        ...(0, perf_005_cross_file_hot_function_1.detectCrossFileHotFunctions)(summaries),
        ...(0, perf_006_multi_caller_hot_function_1.detectMultiCallerHotFunctions)(summaries)
    ];
    // ======================================================
    // NORMALIZATION + LLM
    // ======================================================
    const normalized = (0, normalize_issue_1.normalizeIssues)(archIssues, [...localPerfIssues, ...crossFilePerfIssues], securityIssues, browserIssues);
    console.log("\n🧠 NORMALIZED ISSUES:");
    console.log(JSON.stringify(normalized, null, 2));
    const scanResult = {
        fileTree,
        normalizedIssues: normalized,
        llm: null
    };
   
    
    return scanResult;
}
