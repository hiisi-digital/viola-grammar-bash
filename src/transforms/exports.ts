/**
 * Transform function for detecting exported Bash functions.
 * 
 * Bash exports functions using:
 * - export -f function_name
 * 
 * This transform checks if a function node is exported.
 * 
 * @module
 */

import type { SyntaxNode, QueryCaptures } from "@hiisi/viola/grammars";

/**
 * Check if a function is exported.
 * 
 * Scans source code for "export -f function_name" statements.
 * 
 * @param node - Function syntax node
 * @param captures - Query captures containing function name
 * @returns true if function is exported
 * 
 * @example
 * ```bash
 * function greet() { echo "hello"; }
 * export -f greet
 * ```
 * isExported(node, captures) returns true
 */
export function isExported(node: SyntaxNode, captures: QueryCaptures): boolean {
  // Get function name from captures
  const nameCapture = captures.get("function.name");
  if (!nameCapture) {
    return false;
  }
  
  const functionName = nameCapture.text;
  
  // Get the full source from the root
  let root: SyntaxNode = node;
  while (root.parent) {
    root = root.parent;
  }
  const source = root.text;
  
  // Match: export -f function_name
  const exportRegex = new RegExp(
    `\\bexport\\s+-f\\s+${escapeRegex(functionName)}\\b`,
    "m"
  );
  
  return exportRegex.test(source);
}

/**
 * Escape special regex characters in a string.
 * 
 * @param str - String to escape
 * @returns Escaped string safe for use in RegExp
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
