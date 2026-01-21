"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizePath = normalizePath;
const path_1 = __importDefault(require("path"));
function normalizePath(p) {
    return path_1.default.resolve(p).replace(/\\/g, "/");
}
