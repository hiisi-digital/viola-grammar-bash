/**
 * Tree-sitter queries for extracting Bash import/source statements.
 * 
 * Bash imports files via:
 * - source ./path/to/file.sh
 * - . ./path/to/file.sh
 * 
 * Both are functionally equivalent.
 * 
 * @module
 */

/**
 * Query for extracting import statements.
 * 
 * Captures:
 * - @import.from - Source file path
 * - @import - Entire import command
 */
export const importsQuery = `
; source command
(command
  name: (command_name
    (word) @_cmd)
  argument: (word) @import.from
  (#match? @_cmd "^(source|\\\\.)$")) @import

; source with quoted path
(command
  name: (command_name
    (word) @_cmd)
  argument: (string) @import.from
  (#match? @_cmd "^(source|\\\\.)$")) @import

; source with raw string path
(command
  name: (command_name
    (word) @_cmd)
  argument: (raw_string) @import.from
  (#match? @_cmd "^(source|\\\\.)$")) @import
`;
