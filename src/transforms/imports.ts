/**
 * Transform function for parsing Bash import/source statements.
 * 
 * Bash imports files using:
 * - source path/to/file.sh
 * - . path/to/file.sh
 * 
 * Paths can be:
 * - Literal strings
 * - Quoted strings
 * - Variable interpolations (not resolved statically)
 * 
 * @module
 */

import type { SyntaxNode } from "../types.ts";

/**
 * Parse an import/source statement to extract the file path.
 * 
 * Handles:
 * - Literal paths: source ./utils.sh
 * - Quoted paths: source "./utils.sh"
 * - Single-quoted: source './utils.sh'
 * 
 * Does NOT resolve:
 * - Variable interpolations: source "$LIB_DIR/utils.sh"
 * - Command substitutions: source "$(get_path)"
 * 
 * @param importNode - Import command syntax node
 * @param source - Complete source code
 * @returns Imported file path, or undefined if cannot be determined
 * 
 * @example
 * ```bash
 * source ./lib/utils.sh
 * ```
 * Returns: "./lib/utils.sh"
 */
export function parseImport(importNode: SyntaxNode, source: string): string | undefined {
  const text = source.slice(importNode.startIndex, importNode.endIndex);
  
  // Match: source <path> or . <path>
  // Handles quoted and unquoted paths
  const match = text.match(/(?:source|\.)\s+([^\s;]+)/);
  
  if (!match) {
    return undefined;
  }
  
  let path = match[1];
  
  if (!path) {
    return undefined;
  }
  
  // Remove quotes if present
  if ((path.startsWith('"') && path.endsWith('"')) ||
      (path.startsWith("'") && path.endsWith("'"))) {
    path = path.slice(1, -1);
  }
  
  // Return undefined if path contains variable expansion
  if (path.includes("$") || path.includes("`")) {
    return undefined;
  }
  
  return path;
}
