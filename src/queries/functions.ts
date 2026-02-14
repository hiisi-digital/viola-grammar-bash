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
; Function definitions (all syntax variants produce the same AST node).
; The body is captured as both @function.params and @function.body because
; bash functions declare params implicitly via $1, $2, $@ in the body.
(function_definition
  name: (word) @function.name
  body: (compound_statement) @function.params @function.body) @function
`;
