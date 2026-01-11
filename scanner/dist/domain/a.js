"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.heavyDomainCalc = heavyDomainCalc;
function heavyDomainCalc() {
    JSON.stringify(new Array(5000).fill(1));
}
