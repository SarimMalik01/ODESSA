"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.securityRules = void 0;
const eval_rule_1 = require("./eval-rule");
const innerhtml_rule_1 = require("./innerhtml-rule");
const hardcoded_secrets_1 = require("./hardcoded-secrets");
const new_function_1 = require("./new-function");
exports.securityRules = [
    eval_rule_1.evalRule,
    innerhtml_rule_1.innerHTMLRule,
    hardcoded_secrets_1.hardcodedSecretRule,
    new_function_1.newFunctionRule
];
