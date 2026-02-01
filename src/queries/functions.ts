/**
 * Tree-sitter queries for extracting Bash function definitions.
 * 
 * Bash supports multiple function definition syntaxes:
 * - function foo() { } (keyword with parens)
 * - foo() { } (POSIX style)
 * - function foo { } (keyword without parens)
 * 
 * @module
 */

/**
 * Query for extracting function definitions.
 * 
 * Captures:
 * - @function.name - Function identifier
 * - @function.body - Function body (compound_statement)
 * - @function - Entire function node (for location)
 */
export const functionsQuery = `
; Function definitions with keyword and parentheses
(function_definition
  name: (word) @function.name
  body: (compound_statement) @function.body) @function

; POSIX-style function definitions (name() {})
(function_definition
  name: (word) @function.name
  body: (compound_statement) @function.body) @function
`;
