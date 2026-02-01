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

export { bash } from "./src/grammar.ts";
export type {
  GrammarDefinition,
  GrammarMeta,
  GrammarSource,
  ExtractionQueries,
  GrammarTransforms,
  SyntaxNode,
} from "https://raw.githubusercontent.com/hiisi-digital/viola/main/src/grammars/types.ts";
export type { FunctionParam } from "https://raw.githubusercontent.com/hiisi-digital/viola/main/src/data/types.ts";

// Re-export as default for convenience
export { bash as default } from "./src/grammar.ts";
