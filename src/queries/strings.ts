/**
 * Tree-sitter queries for extracting Bash string literals.
 * 
 * Bash has multiple string types:
 * - Single-quoted strings ('literal $var') - No expansion
 * - Double-quoted strings ("expanded $var") - Variable expansion
 * - ANSI-C strings ($'escaped\n') - Escape sequences
 * - Here-documents (<<EOF)
 * - Here-strings (<<<)
 * 
 * @module
 */

/**
 * Query for extracting string literals.
 * 
 * Captures:
 * - @string.value - String content
 */
export const stringsQuery = `
; Single-quoted strings (raw, no expansion)
(raw_string) @string.value

; Double-quoted strings (with expansion)
(string) @string.value

; ANSI-C quoted strings ($'...')
(ansii_c_string) @string.value

; Here-documents
(heredoc_body) @string.value

; Here-strings
(herestring
  (word) @string.value)
`;
