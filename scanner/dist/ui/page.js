"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderPage = renderPage;
const heavyDomain_1 = require("../domain/heavyDomain");
const values = [1, 2, 3, 4, 5];
function renderPage() {
    for (let i = 0; i < 10; i++) {
        // ❌ UI loop calling domain logic
        (0, heavyDomain_1.heavyDomainCalc)(values);
    }
}
