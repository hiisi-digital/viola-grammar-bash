/**
 * Transform function for parsing Bash documentation comments.
 * 
 * Bash comments start with # and continue to end of line.
 * Multiple consecutive comment lines are treated as a comment block.
 * 
 * @module
 */

import type { SyntaxNode } from "../viola-types.ts";

/**
 * Parse a documentation comment.
 * 
 * Extracts comment text and:
 * - Strips # prefix
 * - Preserves multi-line structure
 * - Trims whitespace
 * 
 * @param commentNode - Comment syntax node
 * @param source - Complete source code
 * @returns Processed comment text
 * 
 * @example
 * ```bash
 * # This is a comment
 * # spanning multiple lines
 * function foo() { }
 * ```
 * Returns: "This is a comment\nspanning multiple lines"
 */
export function parseDocComment(commentNode: SyntaxNode, source: string): string {
  const text = source.slice(commentNode.startIndex, commentNode.endIndex);
  
  // Remove leading # and whitespace
  return text
    .replace(/^#\s?/, "")
    .trim();
}
