/**
 * Transform function for detecting exported Bash functions.
 * 
 * Bash exports functions using:
 * - export -f function_name
 * 
 * This transform scans the source for export commands.
 * 
 * @module
 */

/**
 * Check if a function is exported.
 * 
 * Scans source code for "export -f function_name" statements.
 * 
 * @param functionName - Name of the function to check
 * @param source - Complete source code
 * @returns true if function is exported
 * 
 * @example
 * ```bash
 * function greet() { echo "hello"; }
 * export -f greet
 * ```
 * isExported("greet", source) returns true
 */
export function isExported(functionName: string, source: string): boolean {
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
