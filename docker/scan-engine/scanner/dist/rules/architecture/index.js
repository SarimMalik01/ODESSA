"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runArchitectureRules = runArchitectureRules;
const arch_001_circular_1 = require("./arch-001-circular");
const arch_002_layer_violation_1 = require("./arch-002-layer-violation");
const arch_003_god_module_1 = require("./arch-003-god-module");
const arch_004_unstable_dependency_1 = require("./arch-004-unstable-dependency");
const arch_005_domain_in_ui_loop_1 = require("./arch-005-domain-in-ui-loop");
const arch_006_domain_in_ui_hotpath_1 = require("./arch-006-domain-in-ui-hotpath");
function runArchitectureRules(ctx, summaries, projectRoot) {
    return [
        ...(0, arch_001_circular_1.detectCircularDependencies)(ctx),
        ...(0, arch_002_layer_violation_1.detectLayerViolations)(ctx, projectRoot),
        ...(0, arch_003_god_module_1.detectGodModules)(ctx),
        ...(0, arch_004_unstable_dependency_1.detectUnstableDependencies)(ctx),
        ...(0, arch_005_domain_in_ui_loop_1.detectDomainLogicInUILoops)(ctx, summaries),
        ...(0, arch_006_domain_in_ui_hotpath_1.detectDomainLogicInUIHotPath)(ctx, summaries)
    ];
}
