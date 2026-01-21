"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLoopNode = isLoopNode;
function isLoopNode(node) {
    return [
        "for_statement",
        "while_statement",
        "do_statement",
        "for_in_statement",
        "for_of_statement"
    ].includes(node.type);
}
