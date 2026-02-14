/**
 * Transform function for parsing Bash import/source statements.
 *
 * Bash imports files using:
 * - source path/to/file.sh
 * - . path/to/file.sh
 *
 * Unlike JavaScript/TypeScript, bash has no named imports — sourcing
 * a file brings all its definitions into scope. The import "name"
 * is set to the file path for consistency with the ImportInfo interface.
 *
 * @module
 */

import type { SyntaxNode, QueryCaptures } from "@hiisi/viola/grammars";
import type { ImportInfo } from "@hiisi/viola/data";

/**
 * Parse an import/source statement into ImportInfo.
 *
 * Extracts the file path from the `@import.from` capture and
 * builds a complete ImportInfo. Bash source imports everything
 * from the target file, so `isNamespace` is true.
 *
 * @param node - Import command syntax node
 * @param captures - Query captures (expects @import.from)
 * @param _source - Complete source code (unused)
 * @returns ImportInfo for the source statement
 *
 * @example
 * ```bash
 * source ./lib/utils.sh
 * ```
 * Returns: { name: "./lib/utils.sh", from: "./lib/utils.sh", ... }
 */
export function parseImport(
  node: SyntaxNode,
  captures: QueryCaptures,
  _source: string
): ImportInfo {
  const fromCapture = captures.get("import.from");
  const importCapture = captures.get("import");

  const refNode = importCapture?.node ?? fromCapture?.node ?? node;

  let path = fromCapture?.text ?? "";

  // Remove quotes if present
  if (
    (path.startsWith('"') && path.endsWith('"')) ||
    (path.startsWith("'") && path.endsWith("'"))
  ) {
    path = path.slice(1, -1);
  }

  return {
    name: path, // For bash, the import "name" is the path
    location: {
      file: "", // Overwritten by extractor
      line: refNode.startPosition.row + 1,
      column: refNode.startPosition.column + 1,
      endLine: refNode.endPosition.row + 1,
      endColumn: refNode.endPosition.column + 1,
    },
    from: path,
    isTypeOnly: false,
    isNamespace: true, // Bash source imports everything
  };
}
