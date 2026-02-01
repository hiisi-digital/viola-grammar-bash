/**
 * Tree-sitter queries for extracting Bash export statements.
 * 
 * Bash exports:
 * - export VAR="value" (variable export)
 * - export -f function_name (function export)
 * - declare -x VAR="value" (alternative export)
 * - typeset -x VAR="value" (alternative export)
 * 
 * @module
 */

/**
 * Query for extracting export statements.
 * 
 * Captures:
 * - @export.name - Exported name
 * - @export.kind - Type of export (inferred from context)
 * - @export - Entire export command
 */
export const exportsQuery = `
; export command with variable assignment
(command
  name: (command_name
    (word) @_cmd)
  argument: (word) @export.name
  (#eq? @_cmd "export")) @export

; export with -f flag (function export)
(command
  name: (command_name
    (word) @_cmd)
  argument: (word) @_flag
  argument: (word) @export.name
  (#eq? @_cmd "export")
  (#eq? @_flag "-f")) @export

; declare -x (export variable)
(declaration_command
  name: (word) @_cmd
  argument: (word) @_flag
  argument: (word) @export.name
  (#match? @_cmd "^(declare|typeset)$")
  (#eq? @_flag "-x")) @export
`;
