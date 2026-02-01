/**
 * Transform function for extracting positional parameters from Bash function bodies.
 * 
 * Unlike other languages, Bash functions don't declare parameters. Instead, they use:
 * - $1, $2, $3, ... - Positional parameters
 * - $@ - All arguments as separate words
 * - $* - All arguments as a single string
 * - $# - Number of arguments
 * - ${N:-default} - Parameter with default value
 * 
 * @module
 */

import type { SyntaxNode, FunctionParam } from "../types.ts";

/**
 * Extract positional parameters from a Bash function body.
 * 
 * Scans the function body for parameter references and infers:
 * - Parameter count from highest numbered reference
 * - Optional parameters (those with defaults)
 * - Rest parameters ($@ or $*)
 * 
 * @param bodyNode - Function body syntax node
 * @param source - Complete source code
 * @returns Array of function parameters
 * 
 * @example
 * ```bash
 * function greet() {
 *     local name="$1"
 *     local greeting="${2:-Hello}"
 *     echo "$greeting, $name!"
 * }
 * ```
 * Returns: [{ name: "$1", optional: false }, { name: "$2", optional: true, defaultValue: "Hello" }]
 */
export function parseParams(bodyNode: SyntaxNode, source: string): FunctionParam[] {
  const params: FunctionParam[] = [];
  const body = source.slice(bodyNode.startIndex, bodyNode.endIndex);
  
  // Find all positional parameter references
  // Matches: $1, $2, ${1}, ${1:-default}, ${1-default}
  const positionalRegex = /\$(\d+)|\$\{(\d+)(?::-([^}]*)|:?-([^}]*))?\}/g;
  let maxN = 0;
  const defaults = new Map<number, string>();
  
  let match;
  while ((match = positionalRegex.exec(body)) !== null) {
    const nStr = match[1] || match[2];
    if (!nStr) continue;
    
    const n = parseInt(nStr, 10);
    if (n > maxN) {
      maxN = n;
    }
    // Capture default value if present (:-default or -default)
    const defaultValue = match[3] || match[4];
    if (defaultValue && !defaults.has(n)) {
      defaults.set(n, defaultValue);
    }
  }
  
  // Create params for 1..maxN
  for (let i = 1; i <= maxN; i++) {
    params.push({
      name: `$${i}`,
      optional: defaults.has(i),
      rest: false,
      defaultValue: defaults.get(i),
    });
  }
  
  // Check for $@ or $* (rest parameters)
  if (/\$[@*]|\$\{[@*]\}/.test(body)) {
    params.push({
      name: "$@",
      optional: true,
      rest: true,
    });
  }
  
  return params;
}
