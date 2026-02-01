/**
 * Bash grammar definition for Viola.
 * 
 * Assembles queries and transforms into a complete GrammarDefinition.
 * 
 * @module
 */

import type { GrammarDefinition } from "./types.ts";
import { functionsQuery } from "./queries/functions.ts";
import { stringsQuery } from "./queries/strings.ts";
import { importsQuery } from "./queries/imports.ts";
import { exportsQuery } from "./queries/exports.ts";
import { docsQuery } from "./queries/docs.ts";
import { parseParams } from "./transforms/params.ts";
import { normalizeBody } from "./transforms/normalize.ts";
import { isExported } from "./transforms/exports.ts";
import { parseImport } from "./transforms/imports.ts";
import { parseDocComment } from "./transforms/docs.ts";

/**
 * Complete Bash grammar definition.
 * 
 * Provides:
 * - Tree-sitter configuration for Bash parser
 * - Extraction queries for functions, strings, imports, exports, docs
 * - Transform functions for Bash-specific processing
 * 
 * Supported files:
 * - .sh (Shell scripts)
 * - .bash (Bash scripts)
 * - .bashrc, .bash_profile, .profile (dotfiles)
 * 
 * @example
 * ```ts
 * import { viola } from "@hiisi/viola";
 * import { bash } from "@hiisi/viola-grammar-bash";
 * 
 * export default viola()
 *   .add(bash).as("bash")
 *   .rule(report.error, when.in("*.sh"));
 * ```
 */
export const bash: GrammarDefinition = {
  meta: {
    id: "bash",
    name: "Bash",
    description: "Bash and Shell script grammar for Viola",
    extensions: [".sh", ".bash", ".zsh"],
    globs: [".bashrc", ".bash_profile", ".bash_aliases", ".profile", ".zshrc"],
  },
  
  grammar: {
    source: "npm",
    package: "tree-sitter-bash",
    wasm: "tree-sitter-bash.wasm",
  },
  
  queries: {
    functions: functionsQuery,
    strings: stringsQuery,
    imports: importsQuery,
    exports: exportsQuery,
    docComments: docsQuery,
  },
  
  transforms: {
    parseParams,
    normalizeBody,
    isExported,
    parseImport,
    parseDocComment,
  },
};
