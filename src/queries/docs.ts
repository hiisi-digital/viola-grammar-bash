/**
 * Tree-sitter queries for extracting Bash documentation comments.
 * 
 * Bash comments start with # and continue to end of line.
 * Multiple consecutive comment lines form a comment block.
 * 
 * @module
 */

/**
 * Query for extracting documentation comments.
 * 
 * Captures:
 * - @doc.content - Comment text
 */
export const docsQuery = `
; All comments
(comment) @doc.content
`;
