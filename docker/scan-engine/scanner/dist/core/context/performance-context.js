"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceContext = void 0;
class PerformanceContext {
    constructor() {
        this.loopDepth = 0;
        this.expensiveOpsInLoops = [];
        this.domCallsInLoops = [];
        this.nestedLoops = new Set();
    }
}
exports.PerformanceContext = PerformanceContext;
