"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.traverse = traverse;
function traverse(node, context, enter, leave) {
    enter(node, context);
    for (const child of node.children || []) {
        traverse(child, context, enter, leave);
    }
    leave(node, context);
}
