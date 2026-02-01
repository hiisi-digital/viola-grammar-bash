/**
 * @hiisi/viola-grammar-bash
 *
 * Bash and Shell script grammar package for the Viola convention linter.
 * Provides tree-sitter based parsing and extraction for .sh/.bash files.
 *
 * @example
 * ```ts
 * import { viola, grammar, when } from "@hiisi/viola";
 * import bash from "@hiisi/viola-grammar-bash";
 *
 * export default viola()
 *   .add(bash).as("bash")
 *   .rule(report.error, when.in("*.sh"));
 * ```
 *
 * @module
 */

import type { GrammarDefinition } from "@hiisi/viola/grammars";

/**
 * Bash grammar definition for Viola.
 *
 * Supports:
 * - Shell scripts (.sh)
 * - Bash scripts (.bash)
 * - Common dotfiles (.bashrc, .bash_profile, .profile)
 *
 * Extracts:
 * - Functions (all definition styles)
 * - Positional parameters ($1, $2, $@, $*, $#)
 * - Strings (single/double quoted, here-docs)
 * - Imports (source, .)
 * - Exports (export, export -f, declare -x)
 * - Comments
 */
export const bash: GrammarDefinition = {
  meta: {
    id: "bash",
    name: "Bash",
    description: "Bash and Shell script grammar for Viola",
    extensions: [".sh", ".bash"],
    globs: [".bashrc", ".bash_profile", ".bash_aliases", ".profile"],
  },
  grammar: {
    source: "npm",
    package: "tree-sitter-bash",
    wasm: "tree-sitter-bash.wasm",
  },
  queries: {
    // TODO: Implement function extraction queries
    functions: `
      ; Function definitions with keyword
      (function_definition
        name: (word) @function.name
        body: (compound_statement) @function.body) @function
    `,

    // TODO: Implement string extraction queries
    strings: `
      ; Single-quoted strings (raw, no expansion)
      (raw_string) @string.value

      ; Double-quoted strings (with expansion)
      (string) @string.value
    `,

    // TODO: Implement import extraction queries
    imports: `
      ; source command
      (command
        name: (command_name
          (word) @_cmd)
        argument: (word) @import.from
        (#match? @_cmd "^(source|\\\\.)$")) @import
    `,

    // TODO: Implement export extraction queries
    exports: `
      ; export command
      (command
        name: (command_name
          (word) @_cmd)
        argument: (word) @export.name
        (#eq? @_cmd "export")) @export
    `,

    // TODO: Implement doc comment queries
    docComments: `
      (comment) @doc.content
    `,
  },
  transforms: {
    // TODO: Implement transform functions
    // parseParams: parseBashParams,           // Extract $1, $2, $@, etc.
    // normalizeBody: normalizeBashBody,       // Handle here-docs, quoting
    // isExported: isBashExported,             // Detect export -f
    // parseImport: parseBashImport,           // Handle source/.
    // parseDocComment: parseBashDocComment,   // Extract # comment blocks
  },
};

/**
 * Default export for convenient importing.
 *
 * @example
 * ```ts
 * import bash from "@hiisi/viola-grammar-bash";
 * ```
 */
export default bash;
