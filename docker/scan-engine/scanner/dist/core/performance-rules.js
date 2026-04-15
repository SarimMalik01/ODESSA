"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluatePerformanceRules = evaluatePerformanceRules;
const chalk_1 = __importDefault(require("chalk"));
function evaluatePerformanceRules(ctx, file) {
    // for (const record of ctx.expensiveOpsInLoops) {
    //     const severity = record.loopDepth > 1 ? "HIGH" : "MEDIUM";
    //     console.log(chalk_1.default.yellow(`⚠️ PERFORMANCE [${severity}]`), chalk_1.default.gray(`${file}:${record.node.startPosition.row + 1}`), "\n ", `${record.type} used inside a loop (depth ${record.loopDepth})`, "\n");
    // }
    // for (const record of ctx.domCallsInLoops) {
    //     console.log(chalk_1.default.yellow(`⚠️ PERFORMANCE [MEDIUM]`), chalk_1.default.gray(`${file}:${record.node.startPosition.row + 1}`), "\n ", `DOM access '${record.api}' inside a loop can cause performance issues`, "\n");
    // }
}
