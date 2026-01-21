// utils/rewritePaths.js

/**
 * Rewrites all absolute container paths (/work/<scanId>)
 * into frontend workspace paths (temp/workspace/<scanId>)
 */

export function createPathRewriter(scanId) {
    const CONTAINER_ROOT = `/work/${scanId}`;
    const WORKSPACE_ROOT = `temp/workspace/${scanId}`;
  
    const rewritePath = (p) => {
      if (!p || typeof p !== "string") return p;
      return p.replace(CONTAINER_ROOT, WORKSPACE_ROOT);
    };
  
    const rewriteFileTree = (node) => {
      if (!node) return node;
  
      if (node.path) {
        node.path = rewritePath(node.path);
      }
  
      if (Array.isArray(node.children)) {
        node.children = node.children.map(rewriteFileTree);
      }
  
      return node;
    };
  
    const rewriteNormalizedIssues = (issues = []) =>
      issues.map(issue => {
        const rewritten = structuredClone(issue);
  
        // top-level file
        if (rewritten.file) {
          rewritten.file = rewritePath(rewritten.file);
        }
  
        // location.file
        if (rewritten.location?.file) {
          rewritten.location.file = rewritePath(rewritten.location.file);
        }
  
        // related files
        if (rewritten.related?.fromFile) {
          rewritten.related.fromFile = rewritePath(rewritten.related.fromFile);
        }
  
        if (rewritten.related?.toFile) {
          rewritten.related.toFile = rewritePath(rewritten.related.toFile);
        }
  
        // evidence paths
        if (rewritten.evidence) {
          if (rewritten.evidence.file) {
            rewritten.evidence.file = rewritePath(rewritten.evidence.file);
          }
  
          if (rewritten.evidence.from) {
            rewritten.evidence.from = rewritePath(rewritten.evidence.from);
          }
  
          if (rewritten.evidence.to) {
            rewritten.evidence.to = rewritePath(rewritten.evidence.to);
          }
  
          if (Array.isArray(rewritten.evidence.cycle)) {
            rewritten.evidence.cycle =
              rewritten.evidence.cycle.map(rewritePath);
          }
        }
  
        return rewritten;
      });
  
    return {
      rewriteFileTree,
      rewriteNormalizedIssues,
      workspacePath: WORKSPACE_ROOT
    };
  }
  