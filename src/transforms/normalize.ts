/**
 * Transform functions for normalizing Bash code structures.
 * 
 * Handles:
 * - Here-document normalization (<<EOF, <<-EOF, <<'EOF')
 * - Whitespace normalization
 * - Comment stripping
 * 
 * @module
 */

import type { SyntaxNode } from "../types.ts";

/**
 * Normalize a Bash function body.
 * 
 * Performs:
 * - Strip leading/trailing whitespace
 * - Normalize line endings to \n
 * - Preserve command semantics
 * 
 * Does NOT:
 * - Remove comments (might be meaningful)
 * - Change here-doc content
 * - Modify string literals
 * 
 * @param bodyNode - Function body syntax node
 * @param source - Complete source code
 * @returns Normalized body text
 * 
 * @example
 * ```bash
 * function foo() {
 *     echo "hello"
 *     
 *     echo "world"
 * }
 * ```
 * Returns normalized version with consistent whitespace
 */
export function normalizeBody(bodyNode: SyntaxNode, source: string): string {
  const body = source.slice(bodyNode.startIndex, bodyNode.endIndex);
  
  // Normalize line endings
  let normalized = body.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  
  // Trim leading and trailing whitespace
  normalized = normalized.trim();
  
  return normalized;
}

/**
 * Normalize a here-document.
 * 
 * Handles:
 * - Standard here-docs (<<EOF)
 * - Tab-stripped here-docs (<<-EOF)
 * - Quoted delimiters (<<'EOF')
 * 
 * @param content - Here-doc content
 * @param tabStripped - Whether this is a <<- style here-doc
 * @returns Normalized content
 * 
 * @example
 * ```bash
 * cat <<-EOF
 * 	content here
 * EOF
 * ```
 * Returns "content here" with tabs stripped
 */
export function normalizeHereDoc(content: string, tabStripped: boolean): string {
  if (tabStripped) {
    // Strip leading tabs from each line
    return content
      .split("\n")
      .map(line => line.replace(/^\t+/, ""))
      .join("\n");
  }
  
  return content;
}
