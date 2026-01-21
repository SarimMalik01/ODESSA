"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.browserRules = void 0;
const optional_chaining_1 = require("./optional-chaining");
const nullish_coalescing_1 = require("./nullish-coalescing");
const fetch_1 = require("./fetch");
const intersection_observer_1 = require("./intersection-observer");
const resize_observer_1 = require("./resize-observer");
const clipboard_1 = require("./clipboard");
const web_share_1 = require("./web-share");
const css_grid_1 = require("./css-grid");
const flex_gap_1 = require("./flex-gap");
const promise_all_settled_1 = require("./promise-all-settled");
exports.browserRules = [
    optional_chaining_1.optionalChainingRule,
    nullish_coalescing_1.nullishCoalescingRule,
    fetch_1.fetchRule,
    intersection_observer_1.intersectionObserverRule,
    resize_observer_1.resizeObserverRule,
    clipboard_1.clipboardRule,
    web_share_1.webShareRule,
    css_grid_1.cssGridRule,
    flex_gap_1.flexGapRule,
    promise_all_settled_1.promiseAllSettledRule
];
