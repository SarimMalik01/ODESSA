"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.heavyDomainCalc = heavyDomainCalc;
function heavyDomainCalc(data) {
    // pretend expensive domain logic
    return data.reduce((a, b) => a + b, 0);
}
