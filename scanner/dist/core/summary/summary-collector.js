"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFileSummary = createFileSummary;
function createFileSummary(file) {
    return {
        file,
        imports: new Set(),
        exports: new Set(),
        functionsDefined: new Set(),
        expensiveFunctions: new Set(),
        calledFunctions: new Set(),
        callsInsideLoops: new Set()
    };
}
