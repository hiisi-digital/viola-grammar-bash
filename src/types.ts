/**
 * Type definitions for Viola grammar package.
 * 
 * These types match the structure expected by @hiisi/viola/grammars.
 * Used for development until the viola package is available.
 * 
 * @module
 */

/**
 * Grammar metadata describing supported files and identification.
 */
export interface GrammarMeta {
  /** Unique identifier for the grammar */
  id: string;
  /** Human-readable name */
  name: string;
  /** Description of the grammar */
  description: string;
  /** File extensions this grammar handles (e.g., [".sh", ".bash"]) */
  extensions: string[];
  /** Glob patterns for files without standard extensions */
  globs?: string[];
}

/**
 * Grammar source configuration for tree-sitter.
 */
export interface GrammarSource {
  /** Source type - "npm" for npm packages */
  source: "npm";
  /** NPM package name */
  package: string;
  /** WASM file name within the package */
  wasm: string;
}

/**
 * Extraction queries in tree-sitter S-expression format.
 */
export interface GrammarQueries {
  /** Query for extracting function definitions */
  functions?: string;
  /** Query for extracting string literals */
  strings?: string;
  /** Query for extracting imports (source, .) */
  imports?: string;
  /** Query for extracting exports */
  exports?: string;
  /** Query for extracting documentation comments */
  docComments?: string;
}

/**
 * Function parameter definition.
 */
export interface FunctionParam {
  /** Parameter name (e.g., "$1", "$2", "$@") */
  name: string;
  /** Whether parameter is optional */
  optional: boolean;
  /** Whether parameter captures rest of arguments */
  rest: boolean;
  /** Default value if any */
  defaultValue?: string;
}

/**
 * Tree-sitter syntax node (minimal interface).
 */
export interface SyntaxNode {
  /** Node type name */
  type: string;
  /** Start byte offset in source */
  startIndex: number;
  /** End byte offset in source */
  endIndex: number;
  /** Child nodes */
  children: SyntaxNode[];
  /** Named child nodes */
  namedChildren: SyntaxNode[];
  /** Node text content */
  text: string;
}

/**
 * Transform function signatures for Bash-specific processing.
 */
export interface GrammarTransforms {
  /** Extract positional parameters from function body */
  parseParams?: (bodyNode: SyntaxNode, source: string) => FunctionParam[];
  /** Normalize function body (handle here-docs, quoting) */
  normalizeBody?: (bodyNode: SyntaxNode, source: string) => string;
  /** Check if function is exported */
  isExported?: (functionName: string, source: string) => boolean;
  /** Parse import/source statement */
  parseImport?: (importNode: SyntaxNode, source: string) => string | undefined;
  /** Parse documentation comment */
  parseDocComment?: (commentNode: SyntaxNode, source: string) => string;
}

/**
 * Complete grammar definition for Viola.
 */
export interface GrammarDefinition {
  /** Grammar metadata */
  meta: GrammarMeta;
  /** Grammar source configuration */
  grammar: GrammarSource;
  /** Extraction queries */
  queries: GrammarQueries;
  /** Transform functions */
  transforms?: GrammarTransforms;
}
