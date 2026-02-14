/**
 * Tree-sitter queries for extracting Bash export statements.
 *
 * In tree-sitter-bash, export/declare/typeset are parsed as
 * `declaration_command` nodes (NOT regular `command` nodes).
 * The keyword is an anonymous child, flags are `word` nodes,
 * and variables are `variable_name` or `variable_assignment` nodes.
 *
 * Bash exports:
 * - export VAR (simple variable export)
 * - export VAR="value" (variable export with assignment)
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
 * - @export.name - Exported name (variable_name node)
 * - @export - Entire declaration_command
 */
export const exportsQuery = `
; export with variable assignment: export VAR="value"
(declaration_command
  "export"
  (variable_assignment
    name: (variable_name) @export.name)) @export

; export simple variable: export VAR
(declaration_command
  "export"
  (variable_name) @export.name) @export

; export -f function_name
(declaration_command
  "export"
  (word) @_flag
  (variable_name) @export.name
  (#eq? @_flag "-f")) @export

; declare -x with assignment: declare -x VAR="value"
(declaration_command
  "declare"
  (word) @_flag
  (variable_assignment
    name: (variable_name) @export.name)
  (#match? @_flag "^-.*x")) @export

; declare -x simple variable: declare -x VAR
(declaration_command
  "declare"
  (word) @_flag
  (variable_name) @export.name
  (#match? @_flag "^-.*x")) @export

; typeset -x with assignment: typeset -x VAR="value"
(declaration_command
  "typeset"
  (word) @_flag
  (variable_assignment
    name: (variable_name) @export.name)
  (#match? @_flag "^-.*x")) @export

; typeset -x simple variable: typeset -x VAR
(declaration_command
  "typeset"
  (word) @_flag
  (variable_name) @export.name
  (#match? @_flag "^-.*x")) @export
`;
