"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const heavy_1 = require("./heavy");
for (let i = 0; i < 100; i++) {
    (0, heavy_1.heavyCompute)({ i });
}
